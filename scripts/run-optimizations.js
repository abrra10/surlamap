const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  console.error("\nPlease check your .env.local file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runOptimizations() {
  try {
    console.log("🚀 Starting database optimizations...\n");

    // Read the SQL optimization script
    const sqlPath = path.join(__dirname, "optimize-database.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf8");

    console.log("📋 SQL Optimization Script Generated");
    console.log("=".repeat(50));
    console.log(sqlContent);
    console.log("=".repeat(50));

    console.log("\n📝 Instructions for manual execution:");
    console.log(
      "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
    );
    console.log("2. Select your project");
    console.log("3. Go to SQL Editor");
    console.log("4. Copy and paste the SQL above");
    console.log("5. Click 'Run' to execute all optimizations");
    console.log("\n💡 Tip: You can also run statements individually if needed");

    // Test query performance
    console.log("\n🧪 Testing current query performance...");
    await testQueryPerformance();

    console.log("\n✅ Optimization script ready for manual execution!");
    console.log("📊 After running the SQL, test your application performance.");
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }
}

async function testQueryPerformance() {
  try {
    console.log("   Testing events query...");
    const startTime = Date.now();

    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("date", { ascending: true })
      .limit(10);

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (eventsError) {
      console.log(`   ❌ Events query failed: ${eventsError.message}`);
    } else {
      console.log(`   ✅ Query completed in ${duration}ms`);
      console.log(`   📊 Retrieved ${events?.length || 0} events`);

      if (duration < 500) {
        console.log("   ✅ Query performance is good.");
      } else {
        console.log("   ⚠️  Query performance could be improved.");
      }
    }

    console.log("   Testing registration count query...");
    const regStartTime = Date.now();

    const { data: registrations, error: regError } = await supabase
      .from("registrations")
      .select("event_id, status")
      .eq("status", "confirmed");

    const regEndTime = Date.now();
    const regDuration = regEndTime - regStartTime;

    if (regError) {
      console.log(`   ❌ Registration query failed: ${regError.message}`);
    } else {
      console.log(`   ✅ Registration query completed in ${regDuration}ms`);

      if (regDuration < 500) {
        console.log("   ✅ Registration query performance is good.");
      } else {
        console.log("   ⚠️  Registration query performance could be improved.");
      }
    }
  } catch (error) {
    console.log(`   ❌ Performance test failed: ${error.message}`);
  }
}

// Run the optimizations
runOptimizations();
