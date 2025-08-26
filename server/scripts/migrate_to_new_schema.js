const createHierarchyTables = require('./create_hierarchy_tables');
const updateUsersSystemRole = require('./update_users_system_role');

async function migrateToNewSchema() {
  console.log('🚀 Starting migration to new normalized schema...\n');
  
  try {
    // Step 1: Create hierarchy tables
    console.log('📋 Step 1: Setting up hierarchy tables (departments, sections, units)...');
    await createHierarchyTables();
    console.log('✅ Step 1 completed\n');
    
    // Step 2: Update users with system_role
    console.log('👥 Step 2: Updating users with system_role...');
    await updateUsersSystemRole();
    console.log('✅ Step 2 completed\n');
    
    console.log('🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update employee records to link to appropriate units');
    console.log('2. Test the new org context middleware');
    console.log('3. Verify that job titles now come from units.name');
    console.log('4. Ensure department access is properly scoped by section');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  migrateToNewSchema()
    .then(() => {
      console.log('\n✅ All migrations completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateToNewSchema;
