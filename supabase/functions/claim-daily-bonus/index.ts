
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
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user already claimed bonus today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingBonus } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'bonus')
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`)
      .single();

    if (existingBonus) {
      throw new Error("Daily bonus already claimed today");
    }

    // Use service role for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const bonusAmount = 5000; // ₦50 in kobo

    // Update wallet balance
    const { data: wallet } = await supabaseService
      .from('wallet')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (wallet) {
      const newBalance = wallet.balance + bonusAmount;
      await supabaseService
        .from('wallet')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }

    // Record transaction
    await supabaseService
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'bonus',
        amount: bonusAmount,
        description: 'Daily bonus claimed',
        status: 'completed'
      });

    return new Response(JSON.stringify({ 
      success: true, 
      amount: bonusAmount,
      message: "Daily bonus claimed successfully!" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Daily bonus error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
