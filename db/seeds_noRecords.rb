# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
# delete all the records!
#Button.delete_all
# Need to perform actions to reset the id to start at 1 again
ActiveRecord::Migration.drop_table(:buttons)
# now recreate the table with all the required fields (copyied from schema file)
ActiveRecord::Schema.define(version: 2020_03_14_004513) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  create_table "buttons", id: :serial, force: :cascade do |t|
    t.string "name"
    t.string "group"
    t.string "enable"
    t.integer "seq"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end
end
# refresh the records
#Button.create!(name: 'Cap', group: 'Drink', enable: '10 11 12', seq: 1)
