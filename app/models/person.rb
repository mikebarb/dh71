class Person < ApplicationRecord
  validates_presence_of :name
  has_many :orders, dependent: :destroy
  
  #----------------------------------------------------------------------------------------------------------------------------
  # This solution that supportsan efficient database query to get last order for each person is found at
  # https://www.salsify.com/blog/engineering/most-recent-by-group-in-rails 
  # This solution only generates two database queries, with the pseudo last drink table eager loaded.
  #----------------------------------------------------------------------------------------------------------------------------
  has_one :last_order, -> do
    merge(Order.last_order_by_person)
  end, class_name: "Order", inverse_of: :person

end
