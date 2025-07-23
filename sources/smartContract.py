# SmartContract
# Built with Seahorse v0.2.4
#
# On-chain, persistent FizzBuzz!

from seahorse.prelude import *

# This is your program's public key and it will update
# automatically when you build the project.
declare_id('3N5kd4oVC8sn2gxvoAyVBoZGLWt637Y2ZHBb9SMBcc6p')

## A C C O U N T S ##

#User Account
class User(Account):
  owner: Pubkey
  first_name: str
  second_name: str
  first_last_name: str
  second_last_name: str
  device_id: str
  
  last_post_id: u64
  last_market_id: u64
  last_shipping_id: u64
  last_transaction_id: u64
  last_marketTransaction_id: u64
  last_balance_id: u64

#Post Account
class Post(Account):
  owner: Pubkey
  id: u64
  image: str
  title: str
  description: str
  price: str
  price_offer: str
  available: str

# User Market Account
class Market(Account):
  owner: Pubkey
  id: u64
  market_name: str
  market_focuses_on: str
  market_available: str
  email: str
  street: str
  state: str
  colonia: str
  municipio: str
  zip: str
  num_ext: str
  num_int: str
  number_phone: str
  lat: str
  long: str

# User Shipping Account
class Shipping(Account):
  owner: Pubkey
  id: u64
  label: str
  email: str
  street: str
  state: str
  colonia: str
  municipio: str
  zip: str
  num_ext: str
  num_int: str
  number_phone: str
  lat: str
  long: str

# User Transaction Account
class Transaction(Account):
  owner: Pubkey
  id: u64
  tx: str
  rx: str
  amount: str
  shipping_pubk: str
  timestamp_verify: str
  verify: str
  timestamp_delivered: str
  delivered: str
  items: str

# User MarketTransaction Account
class MarketTransaction(Account):
  owner: Pubkey
  id: u64
  client: str
  order_id: str
  amount: str
  shipping_pubk: str
  timestamp_verify: str
  verify: str
  timestamp_delivered: str
  delivered: str
  items: str

# User Balance Account
class Balance(Account):
  owner: Pubkey
  id: u64
  tp: str
  amount: str
  timestamp: str
  

## I N S T R U C T I O N S ##

#------------------------- U S E R -------------------------#
  
#Create User 
#Sera el owner y tendra permisos restringidos a su contenido
@instruction
def create_user(user: Empty[User], owner: Signer,   
  first_name: str,
  second_name: str,
  first_last_name: str,
  second_last_name: str,
  device_id: str
  ): #Before : Params || After : Logic
  #A wallet can only initialize one account
  user_account = user.init(
    payer = owner,
    seeds = ['user', owner] #New PubKey of the new user based on user & owner as seeds
  )
  user_account.owner = owner.key()
  user_account.first_name = first_name
  user_account.second_name = second_name
  user_account.first_last_name = first_last_name
  user_account.second_last_name = second_last_name
  user_account.device_id = device_id
  print(owner.key(),'created user account',user_account.key())

#------------------------- M A R K E T -------------------------#
  
#Create Market
@instruction
def create_market(
  market: Empty[Market], 
  user: User, 
  owner: Signer,
  market_name: str,
  market_focuses_on: str,
  market_available: str,
  email: str,
  street: str,
  state: str,
  colonia: str,
  municipio: str,
  zip: str,
  num_ext: str,
  num_int: str,
  number_phone: str,
  lat: str,
  long: str,
  market_id: u64
):
  assert user.owner == owner.key(), 'Incorrect Owner' #If false, show message
  assert market_id == user.last_market_id + 1, 'error message' #if id continue be cero, show menssage

  #Initialize market
  market_account = market.init(
    payer = owner,
    seeds = ['market',owner,market_id], #Seahorse limite set user_account.key 
    #so we define the space of the market account content
    space = 8 + 32 + 4 + 128 + 4 + 128 + 4 + 128 + 128 + 128 + 128 + 128 + 128 + 32 + 32 + 32 + 128 + 64 + 64 
  )
  #Update market counter 0 to 1
  user.last_market_id += 1
  market_account.owner = owner.key()
  market_account.market_name = market_name
  market_account.market_focuses_on = market_focuses_on
  market_account.market_available = market_available
  market_account.email = email
  market_account.street = street
  market_account.state = state
  market_account.colonia = colonia
  market_account.municipio = municipio
  market_account.zip = zip
  market_account.num_ext = num_ext
  market_account.num_int = num_int
  market_account.number_phone = number_phone
  market_account.lat = lat
  market_account.long = long
  market_account.id = user.last_market_id

  print(f'market id: {market_id}, market_name: {market_account.market_name}, market_focuses_on: {market_account.market_focuses_on}')

  #Emit new market event
  new_market_event = NewMarketEvent(market_account.owner, market_account.id) #Created the instance whit params
  new_market_event.emit()

#Update market
@instruction
def update_market(market: Market, owner: Signer, 
  market_name: str,
  market_focuses_on: str,
  market_available: str,
  email: str,
  street: str,
  state: str,
  colonia: str,
  municipio: str,
  zip: str,
  num_ext: str,
  num_int: str,
  number_phone: str,
  lat: str,
  long: str
):
    
  assert market.owner == owner.key(), 'Incorrect Owner'

  print('Old market_name:', market.market_name, 'New market_name', market_name)

  market.market_name = market_name
  market.market_focuses_on = market_focuses_on
  market.market_available = market_available
  market.email = email
  market.street = street
  market.state = state
  market.colonia = colonia
  market.municipio = municipio
  market.zip = zip
  market.num_ext = num_ext
  market.num_int = num_int
  market.number_phone = number_phone
  market.lat = lat
  market.long = long

  #Emit update market event
  update_market_event = UpdateMarketEvent(market.owner, market.id) #Created the instance whit params
  update_market_event.emit()

#Delete market
@instruction
def delete_market(market: Market, owner: Signer):
  assert market.owner == owner.key(), 'Incorrect Owner'
  #Close the market (market account) by transferring the lamports to the owner
  market.transfer_lamports(owner, rent_exempt_lamports(1428))

  #Emit update market event
  update_market_event = DeleteMarketEvent(market.owner, market.id) #Created the instance whit params
  update_market_event.emit()
    
#------------------------- P O S T -----------------------------# 
    
#Create Post
@instruction
def create_post(
  post: Empty[Post],
  user: User, 
  owner: Signer,
  title: str,
  image: str,
  description: str,
  price: str,
  price_offer: str,
  available: str,
  post_id: u64
):
  assert user.owner == owner.key(), 'Incorrect Owner' #If false, show message
  assert post_id == user.last_post_id + 1, 'error message' #if id continue be cero, show menssage

  #Initialize post
  post_account = post.init(
    payer = owner,
    seeds = ['post',owner,post_id], #Seahorse limite set user_account.key 
    #so we define the space of the post account content
    space = 8 + 32 + 4 + 128 + 4 + 128 + 128 + 128 + 128 + 128
  )
  #Update post counter 0 to 1
  user.last_post_id += 1
  post_account.owner = owner.key()
  post_account.available = available
  post_account.title = title
  post_account.image = image
  post_account.description = description
  post_account.price = price
  post_account.price_offer = price_offer
  post_account.id = user.last_post_id

  print(f'Post id: {post_id}, title: {post_account.title}, image: {post_account.image}')

  #Emit new post event
  new_post_event = NewPostEvent(post_account.owner, post_account.id) #Created the instance whit params
  new_post_event.emit()
  
#Update Post
@instruction
def update_post(post: Post, owner: Signer, 
  title: str,
  image: str,
  description: str,
  price: str,
  price_offer: str,
  available: str
):
  
  assert post.owner == owner.key(), 'Incorrect Owner'

  #print('Old title:', post.title, 'New title', title)

  post.title = title
  post.image = image
  post.description = description
  post.price = price
  post.price_offer = price_offer
  post.available = available

  #Emit update post event
  update_post_event = UpdatePostEvent(post.owner, post.id) #Created the instance whit params
  update_post_event.emit()

#Delete Post
@instruction
def delete_post(post: Post, owner: Signer):
  assert post.owner == owner.key(), 'Incorrect Owner'
  #Close the post (post account) by transferring the lamports to the owner
  post.transfer_lamports(owner, rent_exempt_lamports(816))

  #Emit update post event
  update_post_event = DeletePostEvent(post.owner, post.id) #Created the instance whit params
  update_post_event.emit()

#------------------------- S H I P P I N G -------------------------#
  
#Create Shipping
@instruction
def create_shipping(
  shipping: Empty[Shipping], 
  user: User, 
  owner: Signer,
  label: str,
  email: str,
  street: str,
  state: str,
  colonia: str,
  municipio: str,
  zip: str,
  num_ext: str,
  num_int: str,
  number_phone: str,
  lat: str,
  long: str,
  shipping_id: u64
):
  assert user.owner == owner.key(), 'Incorrect Owner' #If false, show message
  assert shipping_id == user.last_shipping_id + 1, 'error message' #if id continue be cero, show menssage

  #Initialize shipping
  shipping_account = shipping.init(
    payer = owner,
    seeds = ['shipping',owner,shipping_id], #Seahorse limite set user_account.key 
    #so we define the space of the shipping account content 
    space = 8 + 32 + 4 + 128 + 128 + 128 + 128 + 128 + 128 + 32 + 32 + 32 + 128 + 64 + 64 
  )
  #Update shipping counter 0 to 1
  user.last_shipping_id += 1
  shipping_account.owner = owner.key()
  shipping_account.label = label
  shipping_account.email = email
  shipping_account.street = street
  shipping_account.state = state
  shipping_account.colonia = colonia
  shipping_account.municipio = municipio
  shipping_account.zip = zip
  shipping_account.num_ext = num_ext
  shipping_account.num_int = num_int
  shipping_account.number_phone = number_phone
  shipping_account.lat = lat
  shipping_account.long = long
  shipping_account.id = user.last_shipping_id

  print(f'shipping id: {shipping_id}')

  #Emit new shipping event
  new_shipping_event = NewShippingEvent(shipping_account.owner, shipping_account.id) #Created the instance whit params
  new_shipping_event.emit()

#Update shipping
@instruction
def update_shipping(shipping: Shipping, owner: Signer,
  label: str,
  email: str,
  street: str,
  state: str,
  colonia: str,
  municipio: str,
  zip: str,
  num_ext: str,
  num_int: str,
  number_phone: str,
  lat: str,
  long: str
):
  
  assert shipping.owner == owner.key(), 'Incorrect Owner'

  print('Old label:', shipping.label, 'New label', label)

  shipping.label = label
  shipping.email = email
  shipping.street = street
  shipping.state = state
  shipping.colonia = colonia
  shipping.municipio = municipio
  shipping.zip = zip
  shipping.num_ext = num_ext
  shipping.num_int = num_int
  shipping.number_phone = number_phone
  shipping.lat = lat
  shipping.long = long

  #Emit update shipping event
  update_shipping_event = UpdateShippingEvent(shipping.owner, shipping.id) #Created the instance whit params
  update_shipping_event.emit()

#Delete shipping
@instruction
def delete_shipping(shipping: Shipping, owner: Signer):
  assert shipping.owner == owner.key(), 'Incorrect Owner'
  #Close the shipping (shipping account) by transferring the lamports to the owner
  shipping.transfer_lamports(owner, rent_exempt_lamports(1164))

  #Emit update shipping event
  update_shipping_event = DeleteShippingEvent(shipping.owner, shipping.id) #Created the instance whit params
  update_shipping_event.emit()

#------------------------- T R A N S A C T I O N -----------------------------# 
    
#Create Transaction
@instruction
def create_transaction(
  transaction: Empty[Transaction],
  user: User, 
  owner: Signer,
  tx: str,
  rx: str,
  amount: str,
  shipping_pubk: str,
  timestamp_verify: str,
  verify: str,
  timestamp_delivered: str,
  delivered: str,
  items: str,
  transaction_id: u64
):
  assert user.owner == owner.key(), 'Incorrect Owner' #If false, show message
  assert transaction_id == user.last_transaction_id + 1, 'error message' #if id continue be cero, show menssage

  #Initialize transaction
  transaction_account = transaction.init(
    payer = owner,
    seeds = ['transaction',owner,transaction_id], #Seahorse limite set user_account.key 
    #so we define the space of the transaction account content
    space = 8 + 32 + 4 + 128 + 4 + 128 + 128 + 128 + 128 + 128 + 128 + 128 + 128
  )
  #Update transaction counter 0 to 1
  user.last_transaction_id += 1
  transaction_account.owner = owner.key()
  transaction_account.tx = tx
  transaction_account.rx = rx
  transaction_account.amount = amount
  transaction_account.shipping_pubk = shipping_pubk
  transaction_account.timestamp_verify = timestamp_verify
  transaction_account.verify = verify
  transaction_account.timestamp_delivered = timestamp_delivered
  transaction_account.delivered = delivered
  transaction_account.items = items
  transaction_account.id = user.last_transaction_id

  #print(f'Transaction id: {transaction_id}, title: {transaction_account.title}, image: {transaction_account.image}')

  #Emit new transaction event
  new_transaction_event = NewTransactionEvent(transaction_account.owner, transaction_account.id) #Created the instance whit params
  new_transaction_event.emit()
  
#Update Transaction
@instruction
def update_transaction(transaction: Transaction, owner: Signer, 
  timestamp_delivered: str,
  delivered: str
):
  
  assert transaction.owner == owner.key(), 'Incorrect Owner'

  #print('Old title:', transaction.title, 'New title', title)

  transaction.timestamp_delivered = timestamp_delivered
  transaction.delivered = delivered

  #Emit update transaction event
  update_transaction_event = UpdateTransactionEvent(transaction.owner, transaction.id) #Created the instance whit params
  update_transaction_event.emit()

#---------------------- M A R T K E T   T R A N S A C T I O N --------------------------# 
    
#Create Market Transaction
@instruction
def create_marketTransaction(
  marketTransaction: Empty[MarketTransaction],
  user: User, 
  owner: Signer,
  client: str,
  order_id: str,
  amount: str,
  shipping_pubk: str,
  timestamp_verify: str,
  verify: str,
  timestamp_delivered: str,
  delivered: str,
  items: str,
  marketTransaction_id: u64
):
  assert user.owner == owner.key(), 'Incorrect Owner' #If false, show message
  assert marketTransaction_id == user.last_marketTransaction_id + 1, 'error message' #if id continue be cero, show menssage

  #Initialize marketTransaction
  marketTransaction_account = marketTransaction.init(
    payer = owner,
    seeds = ['marketTransaction',owner,marketTransaction_id], #Seahorse limite set user_account.key 
    #so we define the space of the marketTransaction account content
    space = 8 + 32 + 4 + 128 + 4 + 128 + 128 + 128 + 128 + 128 + 128 + 128 + 128
  )
  #Update marketTransaction counter 0 to 1
  user.last_marketTransaction_id += 1
  marketTransaction_account.owner = owner.key()
  marketTransaction_account.client = client
  marketTransaction_account.order_id = order_id
  marketTransaction_account.amount = amount
  marketTransaction_account.shipping_pubk = shipping_pubk
  marketTransaction_account.timestamp_verify = timestamp_verify
  marketTransaction_account.verify = verify
  marketTransaction_account.timestamp_delivered = timestamp_delivered
  marketTransaction_account.delivered = delivered
  marketTransaction_account.items = items
  marketTransaction_account.id = user.last_marketTransaction_id

  #print(f'Transaction id: {marketTransaction_id}, title: {marketTransaction_account.title}, image: {marketTransaction_account.image}')

  #Emit new marketTransaction event
  new_marketTransaction_event = NewMarketTransactionEvent(marketTransaction_account.owner, marketTransaction_account.id) #Created the instance whit params
  new_marketTransaction_event.emit()
  
#Update Transaction
@instruction
def update_marketTransaction(marketTransaction: Transaction, owner: Signer, 
  timestamp_delivered: str,
  delivered: str
):
  
  assert marketTransaction.owner == owner.key(), 'Incorrect Owner'

  #print('Old title:', marketTransaction.title, 'New title', title)

  marketTransaction.timestamp_delivered = timestamp_delivered
  marketTransaction.delivered = delivered

  #Emit update marketTransaction event
  update_marketTransaction_event = UpdateMarketTransactionEvent(marketTransaction.owner, marketTransaction.id) #Created the instance whit params
  update_marketTransaction_event.emit()

#------------------------- B A L A N C E -----------------------------# 
    
#Create Balance
@instruction
def create_balance(
  balance: Empty[Balance],
  user: User, 
  owner: Signer,
  tp: str,
  amount: str,
  timestamp: str,
  balance_id: u64
):
  assert user.owner == owner.key(), 'Incorrect Owner' #If false, show message
  assert balance_id == user.last_balance_id + 1, 'error message' #if id continue be cero, show menssage

  #Initialize balance
  balance_account = balance.init(
    payer = owner,
    seeds = ['balance',owner,balance_id], #Seahorse limite set user_account.key 
    #so we define the space of the balance account content
    space = 8 + 32 + 4 + 128 + 4 + 128 + 128
  )
  #Update balance counter 0 to 1
  user.last_balance_id += 1
  balance_account.owner = owner.key()
  balance_account.tp = tp
  balance_account.amount = amount
  balance_account.timestamp = timestamp
  balance_account.id = user.last_balance_id

  print(f'Balance id: {balance_id}, amount: {balance_account.amount}, timestamp: {balance_account.timestamp}')

  #Emit new balance event
  new_balance_event = NewBalanceEvent(balance_account.owner, balance_account.id) #Created the instance whit params
  new_balance_event.emit()
  
  
## E V E N T S ##

#------------------------- P O S T -----------------------------#
  
#Trigger to Create Post
class NewPostEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#Trigger to Update Post
class UpdatePostEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#Trigger to Delete Post
class DeletePostEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#------------------------- M A R K E T -----------------------------#


#Trigger to Create market
class NewMarketEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#Trigger to Update market
class UpdateMarketEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#Trigger to Delete market
class DeleteMarketEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#------------------------- S H I P P I N G -----------------------------#

#Trigger to Create shipping
class NewShippingEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#Trigger to Update shipping
class UpdateShippingEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#Trigger to Delete shipping
class DeleteShippingEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#------------------------- T R A N S A C T I O N -----------------------------#
  
#Trigger to Create Transaction
class NewTransactionEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#Trigger to Update Transaction
class UpdateTransactionEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#---------------------- M A R K E T  T R A N S A C T I O N --------------------------#
  
#Trigger to Create MarketTransaction
class NewMarketTransactionEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id

#Trigger to Update MarketTransaction
class UpdateMarketTransactionEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id
    
#------------------------- B A L A N C E -----------------------------#
  
#Trigger to Create Balance
class NewBalanceEvent(Event):
  owner: Pubkey
  id: u64

  def  __init__(self,owner: Pubkey, id:u64):
    self.owner = owner
    self.id = id
    
#Calculate rend to refund afted delete the post
#In this seahorse version can't acces lamports  
def rent_exempt_lamports(size: u64) -> u64:
  return 897840 + 6960 + (size - 1)