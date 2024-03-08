class CreateOrders < ActiveRecord::Migration[7.0]
  def change
    create_table :orders do |t|
      t.references :person, null: false, foreign_key: true
      t.string :drink
      t.string :status

      t.timestamps
    end
  end
end
