import { Context, Devvit, RedditAPIClient, UserContext } from '@devvit/public-api';
import { createTimeoutStore } from './stores/index.js';

Devvit.addAction({
  context: Context.COMMENT,
  userContext: UserContext.MODERATOR,
  name: "Timeout (24 hours)",
  description: "Toggle a 24 hour timeout for the author of this comment. While in timeout, new comments will be automatically deleted.",
  handler: async (event) => {
    const { author } = event.comment;

    if (author === undefined) {
      return { success: false, message: "You cannot timeout a deleted user." };
    }

    const timeoutStore = createTimeoutStore();

    const currentTimeout = timeoutStore.getCurrentTimeoutExpirationForUser(author);

    if (currentTimeout === undefined) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
      await timeoutStore.addTimeoutForUser(author, expiresAt);

      return { success: true, message: `/u/${author} is now in timeout for 24 hours. New comments will be silently deleted.` };
    } else {
      await timeoutStore.removeTimeoutForUser(author);
      return { success: true, message: `/u/${author} is no longer in timeout. Their comments will now show up again.` };
    }
  },
});

Devvit.addTrigger({
  event: Devvit.Trigger.CommentSubmit,
  async handler(request, _metadata) {
    const timeoutStore = createTimeoutStore();
    const reddit = new RedditAPIClient();

    if (request.author?.name === undefined || request.comment === undefined)
      return;

    const { name } = request.author;

    const currentTimeout = await timeoutStore.getCurrentTimeoutExpirationForUser(name);

    if (currentTimeout === undefined)
      return;
    else if (currentTimeout < new Date()) {
      await timeoutStore.removeTimeoutForUser(name);
    } else {
      await reddit.remove(request.comment.id);
    }
  },
});

export default Devvit;
