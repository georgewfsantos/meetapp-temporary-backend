import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class DetailController {
  async index(req, res) {
    const meetup = await Meetup.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ['id', 'title', 'description', 'location', 'date', 'past'],
      include: [
        {
          model: File,
          attributes: ['id', 'path', 'url'],
        },

        {
          model: User,
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    return res.json(meetup);
  }
}

export default new DetailController();
