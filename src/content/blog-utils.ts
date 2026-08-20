import { getCollection } from 'astro:content';

const showDrafts =
  import.meta.env.DEV || import.meta.env.SHOW_DRAFTS === 'true';

export async function getPublishedPosts(collection: 'blogFr' | 'blogEn') {
  const posts = await getCollection(collection);
  return showDrafts ? posts : posts.filter((post) => !post.data.draft);
}
