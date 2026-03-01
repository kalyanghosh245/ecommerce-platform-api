ecommerce-platform
├── shared                                    
│   ├── src
│   │   ├── entities
│   │   │   ├── index.ts                       
│   │   │   ├── base.entity.ts                 
│   │   │   ├── user.entity.ts                 
│   │   │   ├── category.entity.ts             
│   │   │   ├── product.entity.ts              
│   │   │   ├── inventory.entity.ts            
│   │   │   ├── cart.entity.ts                 
│   │   │   ├── cart-item.entity.ts            
│   │   │   ├── order.entity.ts                
│   │   │   ├── order-item.entity.ts           
│   │   │   ├── payment.entity.ts              
│   │   │   └── audit-log.entity.ts            
│   │   ├── dto/
│   │   │   ├── index.ts                       
│   │   │   ├── pagination.dto.ts              
│   │   │   ├── product.dto.ts                 
│   │   │   ├── cart.dto.ts                    
│   │   │   ├── order.dto.ts                   
│   │   │   └── user.dto.ts                    
│   │   ├── utils/
│   │   │   ├── index.ts                       
│   │   │   ├── encryption.utils.ts            
│   │   │   └── response.utils.ts              
│   │   ├── constants/
│   │   │   ├── index.ts                       
│   │   │   └── service.constants.ts           
│   │   └── index.ts                           
│   ├── package.json                           
│   └── tsconfig.json                          
├── services/
│   ├── product-service/                        
│   │   ├── src/
│   │   │   ├── product/
│   │   │   │   ├── product.module.ts          
│   │   │   │   ├── product.service.ts         
│   │   │   │   └── product.controller.ts      
│   │   │   ├── inventory/
│   │   │   │   ├── inventory.module.ts        
│   │   │   │   ├── inventory.service.ts       
│   │   │   │   └── inventory.controller.ts    
│   │   │   ├── app.module.ts                  
│   │   │   └── main.ts                        
│   │   └── package.json                       
│   ├── order-service/                          
│   │   ├── src/
│   │   │   ├── cart/
│   │   │   │   ├── cart.module.ts             
│   │   │   │   ├── cart.service.ts            
│   │   │   │   └── cart.controller.ts         
│   │   │   ├── order/
│   │   │   │   ├── order.module.ts            
│   │   │   │   ├── order.service.ts           
│   │   │   │   └── order.controller.ts        
│   │   │   ├── app.module.ts                  
│   │   │   └── main.ts                        
│   │   └── package.json                       
│   ├── admin-service/                          
│   │   ├── src/
│   │   │   ├── product-admin/
│   │   │   │   ├── product-admin.module.ts    
│   │   │   │   ├── product-admin.service.ts   
│   │   │   │   └── product-admin.controller.ts 
│   │   │   ├── order-admin/
│   │   │   │   ├── order-admin.module.ts      
│   │   │   │   ├── order-admin.service.ts     
│   │   │   │   └── order-admin.controller.ts  
│   │   │   ├── customer-admin/
│   │   │   │   ├── customer-admin.module.ts   
│   │   │   │   ├── customer-admin.service.ts  
│   │   │   │   └── customer-admin.controller.ts ✅
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.module.ts        ✅
│   │   │   │   ├── dashboard.service.ts       ✅
│   │   │   │   └── dashboard.controller.ts    ✅
│   │   │   ├── app.module.ts                  ✅
│   │   │   └── main.ts                        ✅
│   │   └── package.json                       ✅
│   ├── customer-service/                      ✅ COMPLETE
│   │   ├── src/
│   │   │   ├── profile/
│   │   │   │   ├── profile.module.ts          
│   │   │   │   ├── profile.service.ts         
│   │   │   │   └── profile.controller.ts      
│   │   │   ├── address/
│   │   │   │   ├── address.module.ts          
│   │   │   │   ├── address.service.ts         
│   │   │   │   └── address.controller.ts      
│   │   │   ├── preferences/
│   │   │   │   ├── preferences.module.ts      
│   │   │   │   ├── preferences.service.ts     
│   │   │   │   └── preferences.controller.ts   
│   │   │   ├── app.module.ts                  
│   │   │   └── main.ts                        
│   │   └── package.json                       
│   └── notification-service/                   
│       ├── src/
│       │   ├── email/
│       │   │   ├── email.module.ts            
│       │   │   ├── email.service.ts           
│       │   │   └── email.controller.ts        
│       │   ├── sms/
│       │   │   ├── sms.module.ts              
│       │   │   ├── sms.service.ts             
│       │   │   └── sms.controller.ts          
│       │   ├── push/
│       │   │   ├── push.module.ts             
│       │   │   ├── push.service.ts            
│       │   │   └── push.controller.ts         
│       │   ├── template/
│       │   │   ├── template.module.ts         
│       │   │   ├── template.service.ts        
│       │   │   └── template.controller.ts     
│       │   ├── notification-log/
│       │   │   ├── notification-log.module.ts     ✅
│       │   │   ├── notification-log.entity.ts     ✅
│       │   │   ├── notification-log.service.ts    ✅
│       │   │   └── notification-log.controller.ts ✅
│       │   ├── app.module.ts                  
│       │   └── main.ts                        
│       └── package.json                       
├── docker-compose.yml                          
├── .env.example                                                                  
├── README.md                                  
├── setup.bat                                   
├── setup.sh                                    
└── setup.js                                    