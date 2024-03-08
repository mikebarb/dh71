class OrdersController < ApplicationController
  #before_action :set_person 
  #skip_before_action :set_person, except: [:destroy]
  before_action :set_person, only: [:create]

  def create
    @person.orders.create! params.required(:order).permit(:drink, :status)
    redirect_to @person
  end

  # This one was added manually as well as the ROUTE to access it.
  # DELETE /order/1
  def destroy
    @thisOrder = Order.find(params[:id])
    thisPersonId = @thisOrder.person_id
    respond_to do |format|
      if @thisOrder.delete
        format.html { redirect_to person_path(thisPersonId), notice: "Order was successfully destroyed." }
      else
        format.html { redirect_to person_path(thisPersonId), notice: "Failed to delete this order." }
      end
    end
  end

  private
    def set_person
      @person = Person.find(params[:person_id])
    end
end
