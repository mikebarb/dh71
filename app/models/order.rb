class Order < ApplicationRecord
  belongs_to :person
  broadcasts_to :person

  before_validation :set_default_status

  #----------------------------------------------------------------------------------------------------------------------------
  # This solution facilitates efficient database query to get last order for each person is found at
  # https://www.salsify.com/blog/engineering/most-recent-by-group-in-rails 
  # This solution only generates two database queries, with the pseudo last drink table eager loaded.
  #
  # Other options for selection:
  #  WHERE orders.updated_at >= NOW() - '1 day'::INTERVAL
  #  WHERE NOT(orders.status = 'cancelled')
  #
  #----------------------------------------------------------------------------------------------------------------------------
  scope :last_order_by_person, -> do
    from(
      <<-SQL
        (
          SELECT orders.*
          FROM orders JOIN (
            SELECT person_id, max(id) AS id
                FROM orders 
                GROUP BY person_id
          ) last_by_person
          ON orders.id = last_by_person.id
          AND orders.person_id = last_by_person.person_id
        ) orders
      SQL
    )
  end

  def set_default_status
    self.status ||= "new"
  end
end
