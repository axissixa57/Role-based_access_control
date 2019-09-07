# dotenv : This package loads environmental variables from a .env  file into Node’s process.env object.

# jsonwebtoken : provides a means of representing claims to be transferred between two parties ensuring that the information transferred has not been tampered with by an unauthorized third party, we’ll see exactly how this works later on.

- JWT will be used to identify users and determine what resources they’ll be allowed to access

- Когда пользователь логиниться обновляем JWT: create a new token for that user which will replace any previously issued token. That token will ideally be sent by the user along in the header when trying to access any restricted route.

# accesscontrol : provides role and attribute-based access control.

- All roles and permissions were created using the Accesscontrol package, it provides some handy methods for creating roles and defining what actions can be performed by each role, the grant method is used to create a role while methods such as readAny, updateAny, deleteAny, etc… are called action attributes because they define what actions each role can perform on a resource. The resource, in this case, is profile. To keep our application simple and to the point, we defined minimal actions for each role.

-All roles and permissions were created using the Accesscontrol package, it provides some handy methods for creating roles and defining what actions can be performed by each role, the grant method is used to create a role while methods such as readAny, updateAny, deleteAny, etc… are called action attributes because they define what actions each role can perform on a resource. The resource, in this case, is profile. To keep our application simple and to the point, we defined minimal actions for each role.
Inheritance between roles can be achieved using the extend method, this allows a role to inherit all attributes defined on another role. The Accesscontrol package provides a plethora of features and if you want to dig deeper, there’s an in-depth official https://onury.io/accesscontrol/?api=ac available.

## .env В результате это JWT_SECRET=JUST_MY_RANDOM_SECRET_VALUE_4HEAD конвертируется в process.env - JWT_SECRET: 'JUST_MY_RANDOM_SECRET_VALUE_4HEAD',