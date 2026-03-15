const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");
const markdownItAttrs = require("markdown-it-attrs");

module.exports = function(eleventyConfig) {
  // Markdown with footnote and attrs support
  const md = markdownIt({ html: true, typographer: true })
    .use(markdownItFootnote)
    .use(markdownItAttrs);
  eleventyConfig.setLibrary("md", md);

  // Copy static assets
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("assets");

  // Date filters
  eleventyConfig.addFilter("dateDisplay", (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  });

  eleventyConfig.addFilter("dateISO", (date) => {
    return new Date(date).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("dateYear", (date) => {
    return new Date(date).getFullYear();
  });

  eleventyConfig.addFilter("dateMonthDay", (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long"
    });
  });

  eleventyConfig.addFilter("limit", (arr, n) => arr.slice(0, n));

  // Strip date prefix from filename for clean permalinks
  eleventyConfig.addFilter("stripDate", (slug) => {
    return slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  });

  // Get all posts in the same series, sorted by part number
  eleventyConfig.addFilter("seriesPosts", (allPosts, seriesName) => {
    return allPosts
      .filter(p => p.data.series === seriesName)
      .sort((a, b) => (a.data.part || 0) - (b.data.part || 0));
  });

  // Reading time filter
  eleventyConfig.addFilter("readingTime", (content) => {
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  });

  // Collections
  const isPublished = (p) => !p.data.draft;

  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md").filter(isPublished).reverse();
  });

  // Unique series list for generating series pages
  eleventyConfig.addCollection("uniqueSeries", function(collectionApi) {
    const posts = collectionApi.getFilteredByGlob("posts/*.md").filter(isPublished);
    const seriesMap = {};
    posts.forEach(p => {
      if (!p.data.series) return;
      const name = p.data.series;
      if (!seriesMap[name] || p.date > seriesMap[name].date) {
        seriesMap[name] = { name, date: p.date };
      }
    });
    return Object.values(seriesMap)
      .sort((a, b) => b.date - a.date)
      .map(s => s.name);
  });
  eleventyConfig.addCollection("postsByYear", function(collectionApi) {
    const posts = collectionApi.getFilteredByGlob("posts/*.md").filter(isPublished).reverse();
    const byYear = {};
    posts.forEach(post => {
      const year = new Date(post.date).getFullYear();
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(post);
    });
    // Return as sorted array of { year, posts }
    return Object.keys(byYear)
      .sort((a, b) => b - a)
      .map(year => ({ year, posts: byYear[year] }));
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};