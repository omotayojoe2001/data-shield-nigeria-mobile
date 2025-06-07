
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
        type,
        customerEmail: customer?.email
      });

      if (!userId) {
        console.log("No user ID in metadata, skipping wallet update");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Check if transaction already processed to prevent duplicates
      const { data: existingTransaction } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('description', `Paystack payment - ${reference}`)
        .single();

      if (existingTransaction) {
        console.log("Transaction already processed for reference:", reference);
        return new Response(JSON.stringify({ received: true, message: "Already processed" }), {
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

      if (walletError) {
        console.error("Error fetching wallet:", walletError);
        // Try to create wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('wallet')
          .insert({ user_id: userId, balance: 0 })
          .select('balance')
          .single();
        
        if (createError) {
          console.error("Error creating wallet:", createError);
          throw new Error("Failed to create or fetch wallet");
        }
        
        wallet = newWallet;
        console.log("Created new wallet for user:", userId);
      }

      const currentBalance = wallet?.balance || 0;
      const newBalance = currentBalance + amount;

      console.log("Updating wallet balance:", {
        userId,
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

      // Send real-time wallet update notification
      try {
        const channel = supabase.channel(`wallet-updates-${userId}`);
        await channel.send({
          type: 'broadcast',
          event: 'wallet_updated',
          payload: { 
            balance: newBalance, 
            amount: amount,
            reference: reference,
            timestamp: new Date().toISOString()
          }
        });
        console.log("Real-time wallet update event sent for user:", userId);
      } catch (eventError) {
        console.error("Failed to send wallet update event:", eventError);
        // Don't fail the webhook for this
      }

      console.log("Payment processed successfully for reference:", reference, "User:", userId);
      
      return new Response(JSON.stringify({ 
        received: true, 
        processed: true,
        reference: reference,
        user_id: userId,
        amount: amount
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("Event not processed (not charge.success):", event.event);
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      received: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
