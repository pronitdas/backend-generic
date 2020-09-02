const auth = require('@feathersjs/authentication-local')

const { Verifier } = auth;

class CustomVerifier extends Verifier {
  // The verify function has the exact same inputs and 
  // return values as a vanilla passport strategy
  constructor(app, options) {
    super(app, options);
  }
  verify(req, username, password, done) {
    // do your custom stuff. You can call internal Verifier methods
    // and reference this.app and this.options. This method must be implemented.
    // the 'user' variable can be any truthy value
    // the 'payload' is the payload for the JWT access token that is generated after successful authentication
    const skipDifferent = req['body'].firstUser;
    const checkIfActive = (token, user, payload) => {
      let error = false;


      if (user && !user.adminVerified && !skipDifferent) {
        done(null, null, { message: 'Account not authorised by Admin' });
        error = true;
      }

      if (user && !user.active && !skipDifferent) {
        done(null, null, { message: 'User not active' });
        error = true;
      }

      if (user && !user.isVerified && !skipDifferent) {
        done(null, null, { message: 'Account not verified' });
        error = true;
      }



      // if(!user){
      //   error = true;
      //   done(null, null, {message:'User is not registered'});
      // }     
      if (!error) {
        done(null, user, payload);
      } else {
        done(null, null, payload)
      }
    }

    super.verify(req, username, password, checkIfActive);
    // done(null, user, payload);
  }


  _normalizeResult(result) {
    return super._normalizeResult(result);
    // console.log(result)
  }
  _comparePassword(entity, password) {
    if (entity && entity.adminVerified === false) {
      return true
    }
    return super._comparePassword(entity, password)
  }
}

module.exports = CustomVerifier;

