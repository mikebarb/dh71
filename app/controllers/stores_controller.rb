class StoresController < ApplicationController

  # GET /stores/admin
  def admin
  end

  # GET /stores/front or /stores/front.json
  def front
    #----------------------------------------------------------------------------------------------------------------------------
    # This solution of an efficient database query to get last order for each person is found at
    # https://www.salsify.com/blog/engineering/most-recent-by-group-in-rails 
    # This solution only generates two database queries, with the pseudo last drink table eager loaded.
    #----------------------------------------------------------------------------------------------------------------------------
    #@people = Person.includes(:last_order).all
    @people = Person.includes(:last_order).order(:name).all
    @buttons = Button.order(:group, :seq, :name)
  end

  # POST /people or /people.json
  def addperson
    logger.debug params.inspect
    @addperson = Person.new
    # @addperson = Person.new(addperson_params)
    @addperson.name = params["name"]
    respond_to do |format|
      if @addperson.save
        format.html {
          logger.debug "before rendering addperson."
          flash.now.alert = "Person added (" + @addperson.id.to_s + ")."
          render :addperson
          logger.debug "after rendering addperson."
          @person = Person.includes(:last_order).find(@addperson.id)
          thisPersonTarget = "turbo_front_person_" + @person.id.to_s
          logger.debug "before broadcast addperson."
          @person.broadcast_append_later_to 'people', partial: 'stores/frontperson'
          logger.debug "after broadcast addperson."
        }
      else
        format.html {
          flash.now.alert = "failed to add person"
          render :addperson 
        }
      end
    end
  end

  # CREATE /stores/orderdrink
  # this will create or cancel a drink for this person 
  # - person entry already exists
  def orderdrink
    #byebug
    logger.debug params.inspect
    if params[:id] == ''
      return
    end
    if params[:commit] == "Submit Order"
      @person = Person.includes(:last_order).find(params[:id])
      thisPersonTarget = "turbo_front_person_" + params[:id]
      if(!@person.last_order.nil?)
        if @person.last_order.status == "new"
          flash.now.alert = "Already ordered!"
          render :orderdrink
        return
        end
      end
      @thisOrder = @person.orders.new drink: params[:drink]
      @thisOrder.status = "new"
      respond_to do |format|
        if @thisOrder.save
          thisOrderTarget = "turbo_request_order_" + @thisOrder.id.to_s
          format.html {
            flash.now.notice = "Order placed."
            render :orderdrink 
            @thisOrder.broadcast_append_later_to 'orders', partial: 'stores/order'
            # now get the person with the just updated last order
            @person = Person.includes(:last_order).find(params[:id])
            @person.broadcast_replace_later_to 'people', partial: 'stores/frontperson', target: thisPersonTarget
          }
        else
          format.html { 
            flash.now.alert = "failed to submit"
            render :orderdrink  
          }
        end
      end
    elsif params[:commit] == "Cancel Order"
      @person = Person.includes(:last_order).find(params[:id])
      if @person.last_order.status != "new"
        flash.now.alert = "Cannot remove - already made!"
        render :orderdrink
        return
      end
      @thisOrder = @person.last_order
      @thisOrder.status = "cancelled"
      thisOrderTarget = "turbo_request_order_" + @thisOrder.id.to_s
      thisPersonTarget = "turbo_front_person_" + @thisOrder.person_id.to_s
  respond_to do |format|
        if @thisOrder.save
          format.html {
            flash.now.notice = "Order cancelled."
            render :orderdrink 
            @thisOrder.broadcast_replace_later_to 'orders', partial: 'stores/order', target: thisOrderTarget
            # now get the person with the just updated last order
            @person = Person.includes(:last_order).find(params[:id])
            @person.broadcast_replace_later_to 'people', partial: 'stores/frontperson', target: thisPersonTarget
          }
        else
          format.html { 
            flash.now.alert = "failed to update"
            render :orderdrink  
          }
        end
      end
    end
  end

  # GET /people/1 or /people/1.json
  def back
     @orders = Order
               .all
#               .include ("person")
  end

  # GET /stores/brewster
  def brewster
    @orders = Order
              .includes(:person)
              .order(:id)
              .where('updated_at > ?', 24.hours.ago)

    #@orderscount = Order.group(:drink).count
              #.where("status == ?", "new")
              #.includes(:drink)

    @statusList = ["new", "ready", "done"]


  end
  
  # POST /stores/updateStatus
  def updatestatus
    logger.debug("updatestatus called.")
    @thisOrder = Order.includes(:person).find(params[:id])
    thisOrderTarget = "turbo_request_order_" + @thisOrder.id.to_s
    thisPersonTarget = "turbo_front_person_" + @thisOrder.person.id.to_s
    if params[:commit] == "setNew"
      @thisOrder.status = "new"
    end
    if params[:commit] == "setReady"
      @thisOrder.status = "ready"
    end
    if params[:commit] == "setDone"
      @thisOrder.status = "done"
    end
    if params[:commit] == "delete"
      thisPersonId = @thisOrder.person.id
      myOrderId = "turbo_request_order_" + @thisOrder.id.to_s
      respond_to do |format|
        if @thisOrder.delete
          format.html {
            flash.now.notice = "Order deleted." 
            @thisOrder.broadcast_replace_later_to "orders", target: thisOrderTarget
            # Update the front page with person/drink info.
            @person = Person.includes(:last_order).find(thisPersonId)
            @person.broadcast_replace_later_to 'people', partial: 'stores/frontperson', target: thisPersonTarget
          }
          format.turbo_stream{
            @thisOrder.broadcast_remove_to 'orders', target: thisOrderTarget
            @person = Person.includes(:last_order).find(thisPersonId)
            @person.broadcast_replace_later_to 'people', partial: 'stores/frontperson', target: thisPersonTarget
          }
        else
          format.html { 
            flash.now.alert = "failed to delete this order"
            render :partial => 'stores/order', :object => @thisOrder
          }
        end
      end
    else    # processing doNew, doReady or doDone 
      logger.debug("commit is new or ready or done and action it.")
      respond_to do |format|
        if @thisOrder.save
          format.html {
            flash.now.notice = "Order status updated." 
            #render :partial => 'stores/order', :object => @thisOrder
            #@thisOrder.broadcast_replace_later_to 'orders', partial: 'stores/order'
          }
          format.turbo_stream{
            @thisOrder.broadcast_replace_later_to 'orders', partial: 'stores/order', target: thisOrderTarget
            @person = Person.includes(:last_order).find(@thisOrder.person.id)
            @person.broadcast_replace_later_to 'people', partial: 'stores/frontperson', target: thisPersonTarget
          }
       else
          format.html { 
            flash.now.alert = "failed to update status"
            render :partial => 'stores/order', :object => @thisOrder
          }
        end
      end
    end
  end

  # GET /shops/ready
  # GET /shops/ready.json
  def ready
    hostwithport = "#{request.host_with_port}"
    logger.debug hostwithport
    #   a10e513aab9647cfae2f94b7015f74e7.vfs.cloud9.us-east-1.amazonaws.com
    #   drinks.mikebarb.net
    if hostwithport == "drinks.mikebarb.net" 
      hostwithport = "gcc.org.au/drinks"
    end
    @myUrl = "#{request.protocol}" + hostwithport
    @orders = Order
              .where("updated_at > ?", 24.hours.ago)
              .includes(:person)
              .order(:id)

              #.where("updated_at > ? AND status = ?", 24.hours.ago, "ready")

    logger.debug "@readyorders: " + @readyorders.inspect
    
    @statusList = ["ready"]
    logger.debug "@statusList: " + @statusList.inspect
    @readydisplay = true
  end

  private
  # Use callbacks to share common setup or constraints between actions.

  # Only allow a list of trusted parameters through.
  def checkorderdrink_params
    params.require(:id, :drink)
  end

end

