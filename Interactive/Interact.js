document.addEventListener('DOMContentLoaded', function () {
  const FormSubmit = document.getElementById('inputBook');
  FormSubmit.addEventListener('submit', function (event) {
    event.preventDefault();
    TambahBuku();
  });
  if (CekPenyimpanan()) {
    AmbilDataPenyimpanan();
  }

  const FormSearch = document.getElementById('searchBook');
  FormSearch.addEventListener('submit', function (event) {
    event.preventDefault();
    CariBuku();
  });
});


function TambahBuku() {
  const JudulBuku = document.getElementById('inputBookTitle').value;
  const PenulisBuku = document.getElementById('inputBookAuthor').value;
  const TahunBuku = document.getElementById('inputBookYear').value;
  const SelesaiDibaca = document.getElementById('inputBookIsComplete').checked;
  const RakBukuTujuan = SelesaiDibaca ? 'completeBookshelfList' : 'incompleteBookshelfList';
 
  RakBuku.push({
    id: +new Date(),
    title: JudulBuku,
    author: PenulisBuku,
    year: TahunBuku,
    isComplete: SelesaiDibaca,
  });
 
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  document.getElementById('inputBookTitle').value = '';
  document.getElementById('inputBookAuthor').value = '';
  document.getElementById('inputBookYear').value = '';
  document.getElementById('inputBookIsComplete').checked = false;
}


const RakBuku = [];
const RENDER_EVENT = 'render-RakBuku';

document.addEventListener(RENDER_EVENT, function () {
  console.log(RakBuku);
});


function BuatRakBuku(ObjekRakBuku) {
  const textJudul = document.createElement('p');
  textJudul.classList.add("Item-Judul");
  textJudul.innerHTML = `${ObjekRakBuku.title} <span>(${ObjekRakBuku.year})</span>`;
 
  const textPenulis = document.createElement('p');
  textPenulis.innerText = ObjekRakBuku.author;
 
  const textContainer = document.createElement('div');
  textContainer.classList.add('Inner');
  textContainer.append(textJudul, textPenulis);
 
  const container = document.createElement('div');
  container.classList.add('item');
  container.append(textContainer);
  container.setAttribute('id', `book-${ObjekRakBuku.id}`);

  if (ObjekRakBuku.isComplete) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.innerHTML = `<i class='bx bx-undo'></i>`;
 
    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(ObjekRakBuku.id);
    });
 
    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.innerHTML = `<i class='bx bx-trash'></i>`;
 
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(ObjekRakBuku.id);
    });
 
    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.innerHTML = `<i class='bx bx-check'></i>`;
    
    checkButton.addEventListener('click', function () {
      addBookToCompleted(ObjekRakBuku.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.innerHTML = `<i class='bx bx-trash'></i>`;
 
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(ObjekRakBuku.id);
    });
    
    container.append(checkButton, trashButton);
  }
 
  return container;
}


document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBook = document.getElementById('incompleteBookshelfList');
  uncompletedBook.innerHTML = '';

  const completedBook = document.getElementById('completeBookshelfList');
  completedBook.innerHTML = '';
 
  for (const BookItem of RakBuku) {
    const BookElement = BuatRakBuku(BookItem);
    
    if (!BookItem.isComplete)
      uncompletedBook.append(BookElement);
    else
      completedBook.append(BookElement);
  }
});


function addBookToCompleted (BookId) {
  const BookTarget = findBook(BookId);
 
  if (BookTarget == null) return;
 
  BookTarget.isComplete = true;
  BookTarget.lastShelf = 'completeBookshelfList'

  saveData();

  document.dispatchEvent(new Event(RENDER_EVENT));
}


function findBook(BookId) {
  for (const BookItem of RakBuku) {
    if (BookItem.id === BookId) {
      return BookItem;
    }
  }
  return null;
}


function removeBookFromCompleted(BookId) {
  const BookTarget = findBookIndex(BookId);
 
  if (BookTarget === -1) return;
 
  RakBuku.splice(BookTarget, 1);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
 
 
function undoBookFromCompleted(BookId) {
  const BookTarget = findBook(BookId);
 
  if (BookTarget == null) return;
 
  BookTarget.isComplete = false;

  saveData();

  document.dispatchEvent(new Event(RENDER_EVENT));
}


function CariBuku() {
  const CariJudulBuku = document.getElementById('searchBookTitle').value.toLowerCase();

  const HasilCari = RakBuku.filter((book) =>
    book.title.toLowerCase().includes(CariJudulBuku) ||
    book.author.toLowerCase().includes(CariJudulBuku)
  );

  ShowHasilCari(HasilCari);

  document.getElementById('searchBookTitle').value = '';
}


function findBookIndex(BookId) {
  for (const index in RakBuku) {
    if (RakBuku[index].id === BookId) {
      return index;
    }
  }
 
  return -1;
}


function saveData() {
  if (CekPenyimpanan()) {
    const parsed = JSON.stringify(RakBuku, (key, value) => (key === 'year' ? +value : value));
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}


const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
 
function CekPenyimpanan() {
  if (typeof (Storage) === undefined) {
    alert('Maaf, Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}


document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});


function ShowHasilCari(HasilCari) {
  const incompleteBookshelf = document.getElementById('incompleteBookshelfList');
  const completeBookshelf = document.getElementById('completeBookshelfList');

  incompleteBookshelf.innerHTML = '';
  completeBookshelf.innerHTML = '';

  if (HasilCari.length === 0) {
    const searchResult = document.getElementById('SearchResult');
    searchResult.innerHTML = '<p>Tidak ada Buku yang Ditemukan!</p>';
  } else {
    for (const BookItem of HasilCari) {
      const BookElement = BuatRakBuku(BookItem);
      const RakBukuTujuan = BookItem.isComplete ? 'completeBookshelfList' : 'incompleteBookshelfList';
      document.getElementById(RakBukuTujuan).append(BookElement);
    }
  }
}


function AmbilDataPenyimpanan() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData, (key, value) => (key === 'year' ? +value : value));
 
  if (data !== null) {
    RakBuku.length = 0;
    for (const book of data) {
      RakBuku.push(book);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}