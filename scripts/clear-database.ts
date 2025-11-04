import 'dotenv/config'
import connectDB from '../lib/mongodb'
import mongoose from 'mongoose'

async function main() {
  console.log('🗑️  Clearing database...\n')

  try {
    await connectDB()
    const db = mongoose.connection.db

    if (!db) {
      console.error('❌ Database connection failed')
      process.exit(1)
    }

    // Get all collections
    const collections = await db.listCollections().toArray()
    console.log(`Found ${collections.length} collections:\n`)

    if (collections.length === 0) {
      console.log('✅ Database is already empty')
      process.exit(0)
    }

    // List collections
    collections.forEach((col, idx) => {
      console.log(`   ${idx + 1}. ${col.name}`)
    })

    console.log(`\n⚠️  WARNING: This will delete ALL data from the database!`)
    console.log(`   Collections to be deleted: ${collections.length}\n`)

    // Delete all collections
    let deleted = 0
    let errors = 0

    for (const collection of collections) {
      try {
        await db.collection(collection.name).drop()
        console.log(`✅ Deleted: ${collection.name}`)
        deleted++
      } catch (error: any) {
        // Some collections might not be droppable (like system collections)
        if (error.codeName === 'NamespaceNotFound') {
          console.log(`⚠️  Skipped: ${collection.name} (already deleted)`)
        } else {
          console.error(`❌ Error deleting ${collection.name}:`, error.message)
          errors++
        }
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   Deleted: ${deleted}`)
    console.log(`   Errors: ${errors}`)
    console.log(`\n✅ Database cleared successfully!`)

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)

