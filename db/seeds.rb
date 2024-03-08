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
Button.create!(name: 'Cap', group: 'Drink', enable: '10 11 12', seq: 1)
Button.create!(name: 'Flat White', group: 'Drink', enable: '10 11 12', seq: 2)
Button.create!(name: 'Latte', group: 'Drink', enable: '10 11 12', seq: 3)
Button.create!(name: 'Long Black', group: 'Drink', enable: '10 11 19 22', seq: 4)
Button.create!(name: 'Short Black', group: 'Drink', enable: '10 11 19', seq: 5)
Button.create!(name: 'Choc', group: 'Drink', enable: '12 14', seq: 6)
Button.create!(name: 'Tea', group: 'Drink', enable: '16 17 18 29 30 23', seq: 7)
Button.create!(name: 'Tea Herbal', group: 'Drink', enable: '21 24 25 26 27 28', seq: 8) 
Button.create!(name: 'Water', group: 'Drink', enable: '13 15', seq: 9)
Button.create!(name: '1/2', group: 'Strength', enable: '', seq: 1)
Button.create!(name: '1/4', group: 'Strength', enable: '', seq: 2)
Button.create!(name: 'Extra Hot', group: 'Temperature', enable: '', seq: 1)
Button.create!(name: 'Hot', group: 'Temperature', enable: '', seq: 2)
Button.create!(name: 'Warm', group: 'Temperature', enable: '', seq: 3)
Button.create!(name: 'Cold', group: 'Temperature', enable: '', seq: 4)
Button.create!(name: 'Dilmah', group: 'Blend', enable: '', seq: 1)
Button.create!(name: 'English Breakfast', group: 'Blend', enable: '', seq: 2)
Button.create!(name: 'Decaf', group: 'Blend', enable: '', seq: 3)
Button.create!(name: 'Cold Milk', group: 'Misc', enable: '', seq: 1)
Button.create!(name: 'Sugar', group: 'Misc', enable: '', seq: 2)
Button.create!(name: 'Chai', group: 'Blend', enable: '', seq: 1)
Button.create!(name: 'Cold Water', group: 'Misc', enable: '', seq: 3)
Button.create!(name: 'Rooibos', group: 'Blend', enable: '', seq: 6)
Button.create!(name: 'Lemon & Ginger', group: 'Blend', enable: '', seq: 2)
Button.create!(name: 'Orange & Cinnamon', group: 'Blend', enable: '', seq: 3)
Button.create!(name: 'Pure Camomile', group: 'Blend', enable: '', seq: 4)
Button.create!(name: 'Strawberry Raspberry & Loganberry', group: 'Blend', enable: '', seq: 5)
Button.create!(name: 'Pure Peppermint', group: 'Blend', enable: '', seq: 6)
Button.create!(name: 'Earl Grey', group: 'Blend', enable: '', seq: 4)
Button.create!(name: 'Australian Afternoon', group: 'Blend', enable: '', seq: 5)

