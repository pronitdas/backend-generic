
const { Forbidden } = require('@feathersjs/errors');

module.export = async context => {
  const { user } = context.params;
  
  // For admin and superadmin allow everything
  if(user.userType == ('admin') || user.userType == ('superadmin')) {
    return context;
  }
  
  if(!context.id) {
    // When requesting multiple, restrict the query to the user
    context.params.query._id = user._id;
  } else {
    // When acessing a single item, check first if the user is an owner
    const item = await context.service.get(context.id);
  
    if(item._id.toString() !== user._id.toString()) {
      throw new Forbidden('You are not allowed to access this');
    }
  }
  
  return context;
};