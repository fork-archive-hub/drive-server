const { passportAuth } = require('../middleware/passport');

module.exports = (Router, Service, Logger, App) => {

  Router.post('/team-invitation', passportAuth, function (req, res) {

    const { token } = req.body.token;

    Service.TeamInvitations.getByToken(token).then((teamInvitation) => {

        Service.TeamsMembers.update(teamInvitation).then(() => {
          res.status(200).json({});
        }).catch(() => {
          res.status(500).json({error: 'Invalid Team invitation link'});
        });
        
    }).catch((err) => {
      res.status(500).json({error: 'Invalid Team invitation link'});
    });
  });
}