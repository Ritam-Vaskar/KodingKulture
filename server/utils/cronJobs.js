import cron from 'node-cron';
import Contest from '../models/Contest.js';

// Run every minute to check contest status
export const updateContestStatus = cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    // Update contests to LIVE
    await Contest.updateMany(
      {
        status: 'UPCOMING',
        startTime: { $lte: now },
        isPublished: true
      },
      {
        $set: { status: 'LIVE' }
      }
    );

    // Update contests to ENDED
    await Contest.updateMany(
      {
        status: 'LIVE',
        endTime: { $lte: now }
      },
      {
        $set: { status: 'ENDED' }
      }
    );

    console.log('✅ Contest status updated');
  } catch (error) {
    console.error('❌ Error updating contest status:', error);
  }
});

export const startCronJobs = () => {
  updateContestStatus.start();
  console.log('✅ Cron jobs started');
};
