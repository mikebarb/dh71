class PeopleController < ApplicationController
  before_action :set_person, only: %i[ show edit update destroy ]

  # GET /people or /people.json
  def index
    @people = Person.all
  end

  # GET /people/1 or /people/1.json
  def show
  end

  # GET /people/new   (Not required)
  # New people added through stores_front.
  ##def new
  ##  @person = Person.new
  ##end

  # GET /people/1/edit
  def edit
  end

  # POST /people or /people.json   (Not required)
  # New people added through stores_front.
  ##def create
  ##  @person = Person.new(person_params)
  
  ##  respond_to do |format|
  ##    if @person.save
  ##      format.html { redirect_to person_url(@person), notice: "Person was successfully created." }
  ##      format.json { render :show, status: :created, location: @person }
  ##    else
  ##      format.html { render :new, status: :unprocessable_entity }
  ##      format.json { render json: @person.errors, status: :unprocessable_entity }
  ##    end
  ##  end
  ##end

  # PATCH/PUT /people/1 or /people/1.json
  def update
    respond_to do |format|
      if @person.update(person_params)
        format.html { redirect_to person_url(@person), notice: "Person was successfully updated." }
        format.json { render :show, status: :ok, location: @person }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @person.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /people/1 or /people/1.json
  def destroy
    @person.destroy
    personName = @person.name
    respond_to do |format|
      format.html { redirect_to people_url, notice: "Person (" + personName + ") was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_person
      # Originally only needed to find person and rails automatically 
      # found the associated records as well. However, the order was randomn.
      # @person = Person.find(params[:id])
      # Changed this so that we now control the order of the orders.
      @person = Person.includes(:orders).order("orders.id desc").find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def person_params
      params.require(:person).permit(:name)
    end
end
