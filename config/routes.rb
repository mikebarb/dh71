Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  resources :buttons
  resources :people do 
    resources :orders
  end
  get  'stores/front',        to: 'stores#front',         as: :stores_front
  get  'stores/brewster',     to: 'stores#brewster',      as: :stores_brewster
  get  'stores/ready',        to: 'stores#ready',         as: :stores_ready
  post 'stores/orderdrink',   to: 'stores#orderdrink',    as: :stores_orderdrink
  post 'stores/addperson',    to: 'stores#addperson',     as: :stores_addperson
  post 'stores/updatestatus', to: 'stores#updatestatus',  as: :stores_updatestatus
  get  'stores/admin',        to: 'stores#admin',         as: :stores_admin
  delete 'orders/:id',        to: 'orders#destroy',       as: :order
  get  'buttonshelp',        to: 'buttons#help',          as: :buttonshelp        
 
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
  root 'stores#front'
end
