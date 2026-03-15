module.exports = {
  permalink: (data) => {
    if (data.draft) return false;
    const slug = data.page.fileSlug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    return `/essays/${slug}/`;
  }
};
 