
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-paystack-signature");
    console.log("Webhook received with signature:", signature ? "present" : "missing");

    const body = await req.text();
    const event = JSON.parse(body);

    console.log("Webhook event:", event.event, "data:", JSON.stringify(event.data, null, 2));

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (event.event === "charge.success") {
      const { customer, amount, metadata, reference, status } = event.data;
      const userId = metadata?.user_id;
      const type = metadata?.type || 'topup';

      console.log("Processing successful charge:", {
        userId,
        amount,
        reference,
        status,
        type
      });

      if (!userId) {
        console.log("No user ID in metadata, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Check if transaction already processed
      const { data: existingTransaction } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('description', `Paystack payment - ${reference}`)
        .single();

      if (existingTransaction) {
        console.log("Transaction already processed for reference:", reference);
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Get current wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (walletError || !wallet) {
        console.error("Error fetching wallet:", walletError);
        throw new Error("Wallet not found");
      }

      const currentBalance = wallet.balance || 0;
      const newBalance = currentBalance + amount;

      console.log("Updating wallet balance:", {
        currentBalance,
        amountToAdd: amount,
        newBalance
      });

      // Update wallet balance
      const { error: updateError } = await supabase
        .from('wallet')
        .update({ 
          balance: newBalance, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error("Error updating wallet:", updateError);
        throw updateError;
      }

      console.log("Wallet updated successfully from", currentBalance, "to", newBalance);

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: type,
          amount: amount,
          description: `Paystack payment - ${reference}`,
          status: 'completed'
        });

      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
        throw transactionError;
      }

      console.log("Transaction recorded successfully");

      // Send wallet update event
      try {
        await supabase
          .channel(`wallet-updates-${userId}`)
          .send({
            type: 'broadcast',
            event: 'wallet_updated',
            payload: { balance: newBalance, amount: amount }
          });
        console.log("Wallet update event sent");
      } catch (eventError) {
        console.log("Failed to send wallet update event:", eventError);
      }

      console.log("Payment processed successfully for reference:", reference);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
