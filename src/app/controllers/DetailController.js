import Meetup from '../models/Meetup';

class DetailController {
  async index(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);
    return res.json(meetup);
  }
}

export default new DetailController();
