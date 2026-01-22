const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../posts');
const outputFile = path.join(__dirname, '../blog_data.js');
const sitemapFile = path.join(__dirname, '../sitemap.xml');
const SITE_URL = 'https://bimservicesindia.com'; // Updated URL placeholder


function getMetaContent(content, name) {
    const match = content.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i')) ||
        content.match(new RegExp(`<meta\\s+content="([^"]*)"\\s+name="${name}"`, 'i'));
    return match ? match[1] : '';
}

function getTitle(content) {
    const match = content.match(/<title>([^<]*)<\/title>/i);
    return match ? match[1].replace(' | BIM Services India', '').trim() : 'Untitled Post';
}

// Function to extract first significant image src from content
function getFirstImage(content) {
    // Find all images
    const regex = /<img[^>]+src="([^">]+)"/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
        // Skip avatars or icons if identified by URL
        if (!match[1].includes('ui-avatars') && !match[1].includes('icon')) {
            return match[1];
        }
    }
    return null;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

try {
    const files = fs.existsSync(postsDir) ? fs.readdirSync(postsDir) : [];

    const posts = files
        .filter(file => file.endsWith('.html'))
        .map(file => {
            const filePath = path.join(postsDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const stats = fs.statSync(filePath);

            // Try to get date from meta tag, fallback to file creation time
            const metaDate = getMetaContent(content, 'date');
            const date = metaDate ? new Date(metaDate) : stats.birthtime;

            return {
                filename: file,
                url: `post/${file}`,
                title: getTitle(content),
                description: getMetaContent(content, 'description') || 'Read this article to learn more.',
                date: formatDate(date),
                isoDate: date.toISOString(), // For sorting
                tags: ['Technology'],
                image: getFirstImage(content) || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            };
        })
        // Sort by date descending (newest first)
        .sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));

    // Output as a JSON file
    const outputJsonFile = path.join(__dirname, '../blog.json');
    const jsonContent = JSON.stringify(posts, null, 2);

    fs.writeFileSync(outputJsonFile, jsonContent);
    console.log(`Successfully generated blog index (JSON) with ${posts.length} posts.`);

    // --- Generate Sitemap ---
    const staticPages = [
        'index.html',
        'blog.html'
    ];

    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    staticPages.forEach(page => {
        sitemapContent += `    <url>
        <loc>${SITE_URL}/${page}</loc>
        <changefreq>weekly</changefreq>
        <priority>${page === 'index.html' ? '1.0' : '0.8'}</priority>
    </url>
`;
    });

    // Add blog posts
    posts.forEach(post => {
        sitemapContent += `    <url>
        <loc>${SITE_URL}/${post.url}</loc>
        <lastmod>${post.date}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
`;
    });

    sitemapContent += `</urlset>`;

    fs.writeFileSync(sitemapFile, sitemapContent);
    console.log(`Successfully generated sitemap.xml with ${staticPages.length + posts.length} URLs.`);

} catch (err) {
    console.error('Error generating blog assets:', err);
    process.exit(1);
}
