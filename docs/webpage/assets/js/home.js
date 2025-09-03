const postsContainer = document.getElementById('posts-container');
const paginationContainer = document.getElementById('pagination-container');
const postsPerPage = 3;
let currentPage = 1;

async function fetchAndDisplayPosts() {
  postsContainer.innerHTML = '';
  const start = (currentPage - 1) * postsPerPage;
  const end = start + postsPerPage;
  const postsToFetch = postManifest.slice(start, end);

  // Fetch all posts in parallel
  const fetchPromises = postsToFetch.map(post =>
    fetch(post.htmlPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error loading ${post.htmlPath}: ${response.status}`);
        }
        return response.text();
      })
  );

  let postContents = [];
  try {
    postContents = await Promise.all(fetchPromises);
  } catch (err) {
    console.error(err);
    postsContainer.innerHTML = '<p>Sorry, failed to load posts.</p>';
    return;
  }

  // Render posts
  postsToFetch.forEach((post, i) => {
    const article = document.createElement('article');
    article.classList.add('post');
    article.innerHTML = `
      <h3>${post.title}</h3>
      <p class="post-date">${post.date}</p>
      <hr>
      ${postContents[i]}
    `;
    postsContainer.appendChild(article);
  });
}

function setupPagination() {
  paginationContainer.innerHTML = '';
  const pageCount = Math.ceil(postManifest.length / postsPerPage);
  if (pageCount <= 1) return;

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    if (i === currentPage) {
      btn.disabled = true;
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      currentPage = i;
      fetchAndDisplayPosts();
      setupPagination();
    });
    paginationContainer.appendChild(btn);
  }
}

window.onload = () => {
  fetchAndDisplayPosts();
  setupPagination();
};
