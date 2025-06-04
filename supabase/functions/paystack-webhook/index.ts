
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
    if (!signature) {
      throw new Error("No signature provided");
    }

    const body = await req.text();
    const event = JSON.parse(body);

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (event.event === "charge.success") {
      const { customer, amount, metadata, reference } = event.data;
      const userId = metadata?.user_id;
      const type = metadata?.type || 'topup';

      if (!userId) {
        console.log("No user ID in metadata, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      console.log(`Processing payment for user ${userId}, amount: ${amount}, type: ${type}, reference: ${reference}`);

      // Check if transaction already processed
      const { data: existingTransaction } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('description', `Paystack payment - ${reference}`)
        .single();

      if (existingTransaction) {
        console.log("Transaction already processed");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Update wallet balance
      const { data: wallet } = await supabase
        .from('wallet')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (wallet) {
        const newBalance = wallet.balance + amount;
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

        console.log(`Updated wallet balance from ${wallet.balance} to ${newBalance}`);
      } else {
        console.error("Wallet not found for user");
        throw new Error("Wallet not found");
      }

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

      // If it's a data plan purchase, create/update user plan
      if (type === 'data') {
        const dataMB = metadata?.data_mb || 1024; // Default to 1GB
        
        // Deactivate current plan
        await supabase
          .from('user_plans')
          .update({ status: 'inactive' })
          .eq('user_id', userId)
          .eq('status', 'active');

        // Create new data plan
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // 30 days

        const { error: planError } = await supabase
          .from('user_plans')
          .insert({
            user_id: userId,
            plan_type: 'data',
            status: 'active',
            data_allocated: dataMB,
            data_used: 0,
            expires_at: expiryDate.toISOString()
          });

        if (planError) {
          console.error("Error creating data plan:", planError);
        }

        // Record plan history
        await supabase
          .from('plan_history')
          .insert({
            user_id: userId,
            to_plan: 'data',
            notes: `Purchased ${dataMB}MB data plan - ${reference}`
          });

        console.log(`Created data plan with ${dataMB}MB for user ${userId}`);
      }

      console.log("Payment processed successfully");
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
