import '../src/sass/index.scss';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const inputSearchForm = document.querySelector('#search-form');
const galleryList = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');

inputSearchForm.addEventListener('submit', onFormSubmitAsync);
btnLoadMore.addEventListener('click', onBtnLoadMoreClickAsync);

let gallery = new SimpleLightbox('.gallery .photo-card');
let page = 1;
let searchQuery = '';
const PER_PAGE = 40;

const URL = 'https://pixabay.com/api/';
const KEY = '?key=25246823-37314bed22bcdc498ffe68995';
const PARAMETR = `&image_type=photo&orientation=horizontal&safesearch=true&per_page=${PER_PAGE}`;

async function fetchGaleryAsync(value, page) {
  const response = await axios.get(
    `${URL}${KEY}${PARAMETR}&q=${value}&page=${page}`
  );
  const images = await response.data;
  return images;
}

async function onFormSubmitAsync(event) {
  event.preventDefault();
  galleryList.innerHTML = '';
  searchQuery = inputSearchForm.elements.searchQuery.value;

  try {
    const { hits, totalHits } = await fetchGaleryAsync(searchQuery, page);

    if (!totalHits) {
      Notify.failure('Sorry, no matches were found for your query.');
      return;
    }

    Notify.success(`Hooray! We found ${totalHits} images.`);
    renderResult({ hits, totalHits });
  } catch (error) {
    console.log(error.message);
  }
}

function renderResult({ hits, totalHits }) {
  const imagesMarkup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a class="gallery-item" href="${largeImageURL}">
      <div class="photo-card">
        <div class="container-card">
          <img src="${webformatURL}" class="card-image" alt="${tags}" loading="lazy" />
        </div>  
        <div class="info">
          <p class="info-item">
            <b>Likes </b>${likes}
          </p>
          <p class="info-item">
            <b>Views </b>${views}
          </p>
          <p class="info-item">
            <b>Comments </b>${comments}
          </p>
          <p class="info-item">
            <b>Downloads </b>${downloads}
          </p>
        </div>
      </div>
    </a>`;
      }
    )
    .join('');

  galleryList.insertAdjacentHTML('beforeend', imagesMarkup);

  lightbox.refresh();

  renderLoadMoreButton(totalHits);
  smoothScroolToTheNextPage();
}

function smoothScroolToTheNextPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function renderLoadMoreButton(totalHits) {
  const pagesTotal = Math.ceil(totalHits / PER_PAGE);
  const isLastPage = pagesTotal === page;
  const isOnlyOnePageAvailable = pagesTotal === 1;

  if (!isOnlyOnePageAvailable) {
    btnLoadMore.classList.remove('is-hidden');
  }

  if (isLastPage && !isOnlyOnePageAvailable) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    btnLoadMore.classList.add('is-hidden');
  }
}

async function onBtnLoadMoreClickAsync() {
  try {
    page += 1;
    const images = await fetchGaleryAsync(searchQuery, page);
    renderResult(images);
  } catch (error) {
    console.log(error.message);
  }
}

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 300,
});
