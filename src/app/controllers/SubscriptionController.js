import { Op } from 'sequelize';
import User from '../models/User';
import Meetup from '../models/Meetup';
import File from '../models/File';
import Subscription from '../models/Subscription';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      attributes: ['id'],
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          attributes: ['id', 'title', 'description', 'location', 'date', 'past'],
          required: true,
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
        },
      ],
      order: [[Meetup, 'date']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [User],
    });

    if (meetup.user_id === req.userId) {
      return res.status(400).json({
        error: 'You are not allowed to subscribe to your own meetups',
      });
    }

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'You cannot subscribe to past meetups' });
    }

    const subscribed = await Subscription.findOne({
      where: { user_id: req.userId, meetup_id: req.params.meetupId },
    });

    if (subscribed) {
      return res.status(400).json({
        error: 'You have already subscribed to that meetup',
      });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res.status(400).json({
        error: 'You have already subscribed to a meetup at that same time.',
      });
    }

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json(subscription);
  }

  async delete(req, res) {
    const subscription = await Subscription.findByPk(req.params.id);
    if (!subscription) {
      return res.status(400).json({
        error:
          'Subscription was not found.Please check if the information is correct',
      });
    }
    if (subscription.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this subscription.",
      });
    }

    await subscription.destroy();

    return res.send({ message: 'Subscription successfully deleted' });
  }
}

export default new SubscriptionController();
