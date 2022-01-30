jQuery(function($) {
  const WIDTH = 3;
  const HEIGHT = 3;
  const SIZE = 300;
  const LEAST_IDIOM_NUM = 1;
  $('#puzzle-main')
    .css('width', SIZE * WIDTH + 'px')
    .css('height', SIZE * HEIGHT + 'px');
  $('#btn-start')
    .css('top', (SIZE * HEIGHT - 30) / 2 + 'px')
    .css('left', (SIZE * WIDTH - 100) / 2 + 'px');

  function random(n) {
    return Math.floor(Math.random() * n);
  }

  function checkPossible(deck) {
    return deck
      .flatMap(e0 => deck.flatMap(e1 => e0 != e1 ? [e0 + e1] : []))
      .flatMap(e => idiomList.includes(e) ? [e] : []);
  }

  function checkLines(deck) {
    const array = [];
    for (let c = 0; c < WIDTH - 1; c++) {
      for (let r = 0; r < HEIGHT; r++) {
        const wideIdiom = deck[c * HEIGHT + r] + deck[(c + 1) * HEIGHT + r]
        if (idiomList.includes(wideIdiom)) {
          array.push(wideIdiom);
        }
      }
    }
    for (let c = 0; c < WIDTH; c++) {
      for (let r = 0; r < HEIGHT - 1; r++) {
        const highIdiom = deck[c * HEIGHT + r] + deck[c * HEIGHT + (r + 1)]
        if (idiomList.includes(highIdiom)) {
          array.push(highIdiom);
        }
      }
    }
    return array;
  }

  function createDeck() {
    while (true) {
      const deck = new Array(WIDTH * HEIGHT)
        .fill().map(_ => kanjiList[random(kanjiList.length)]);
      if (checkPossible(deck).length > LEAST_IDIOM_NUM && checkLines(deck).length == 0) {
        return deck;
      }
    }
  }

  //import kanjiData from './data.js';
  const kanjiList = Object.keys(kanjiData)
    .map(k => ([k, kanjiData[k]]))
    .flatMap(k => (k[1].length > 0) ? [k] : [])
    .map(k => k[0]);
  const idiomList = Object.values(kanjiData).flat();
  const deck = createDeck();

  console.log(checkPossible(deck));

  function init() {
    for (let c = 0; c < WIDTH; c++) {
      for (let r = 0; r < HEIGHT; r++) {
        $('#puzzle-main')
          .append(`<span class='drop' id='${c}-${r}'>${deck[c*HEIGHT+r]}</span>`)
        $(`#${c}-${r}`)
          .css('top', `${SIZE*(r-HEIGHT)}px`)
          .css('left', `${SIZE*c}px`)
          .animate({
            top: `${SIZE*r}px`
          }, 'slow');
      }
    }
    $('.drop')
      .css('width', `${SIZE}px`)
      .css('height', `${SIZE}px`)
      .css('font-size', `${SIZE*0.8}px`)
      .css('line-height', `${SIZE}px`)
      .css('opacity', '1.0');
    $('.drop').promise().done(function() {
      checkDrop();
    });
  }

  function makeDrop() {
    const deck = (function() {
      while (true) {
        let array = [];
        for (let c = 0; c < WIDTH; c++) {
          for (let r = 0; r < HEIGHT; r++) {
            if (!$(`#${c}-${r}`).hasClass('checked')) {
              array.push($(`#${c}-${r}`).html());
            }
          }
        }
        array = array.flatMap(k => kanjiList.includes(k) ? [k] : []);
        for (let c = 0; c < WIDTH; c++) {
          for (let r = 0; r < HEIGHT; r++) {
            if ($(`#${c}-${r}`).hasClass('checked')) {
              if (random(2)) {
                array.splice(c * HEIGHT + r, 0,
                  kanjiList[random(kanjiList.length)]);
              } else {
                const choice = array[random(array.length)];
                array.splice(c * HEIGHT + r, 0,
                  kanjiData[choice][random(kanjiData[choice].length)].replace(choice, ''));
              }
            }
          }
        }
        if (checkPossible(array).length > LEAST_IDIOM_NUM && checkLines(array).length == 0) {
          return array;
        }
      }
    }());

    console.log(checkPossible(deck));

    for (let c = 0; c < WIDTH; c++) {
      for (let r = 0; r < HEIGHT; r++) {
        if ($(`#${c}-${r}`).hasClass('checked')) {
          $(`#${c}-${r}`)
            .html(deck[c * HEIGHT + r]);
        }
      }
    }

    for (let c = 0; c < WIDTH; c++) {
      for (let r = 0; r < HEIGHT; r++) {
        $(`#${c}-${r}`)
          .css('top', `${SIZE*r}px`)
          .animate({
            opacity: 1.0,
            top: `${SIZE*r}px`
          }, 'slow');
      }
    }
    $('.drop').promise().done(function() {
      $('.drop').removeClass('checked');
      checkDrop();
    });
  }

  function checkDrop() {
    for (let c = 0; c < WIDTH; c++) {
      for (let r = 0; r < HEIGHT; r++) {
        const wideIdiom = $(`#${c}-${r}`).text() + $(`#${c+1}-${r}`).text();
        if (idiomList.includes(wideIdiom)) {
          $(`#${c}-${r}`).addClass('checked');
          $(`#${c+1}-${r}`).addClass('checked');
        }
        const highIdiom = $(`#${c}-${r}`).text() + $(`#${c}-${r+1}`).text();
        if (idiomList.includes(highIdiom)) {
          $(`#${c}-${r}`).addClass('checked');
          $(`#${c}-${r+1}`).addClass('checked');
        }
      }
    }
    if ($('.checked').is('*')) {
      $('.checked').fadeTo('normal', 0)
        .promise().done(function() {
          $('.checked').css('top', `-${SIZE}px`);
          makeDrop();
        });
    } else {
      $('.drop').draggable('enable');
    }
  }

  $('#btn-start').on('click', function() {
    $('#puzzle-main').disableSelection().empty();
    init();
    let dropC, dropR, currentDropC, currentDropR
    $('.drop').draggable({
      opacity: 0.5,
      containment: '#puzzle-main',
      start: function(event, ui) {
        dropC = Math.floor(ui.position.left / SIZE + 0.5);
        dropR = Math.floor(ui.position.top / SIZE + 0.5);
      },
      drag: function(event, ui) {
        currentDropC = Math.floor(ui.position.left / SIZE + 0.5);
        currentDropR = Math.floor(ui.position.top / SIZE + 0.5);
        if (dropC != currentDropC || dropR != currentDropR) {
          $(`#${currentDropC}-${currentDropR}`)
            .animate({
              left: `${SIZE*dropC}px`,
              top: `${SIZE*dropR}px`
            }, 'fast')
            .attr('id', `${dropC}-${dropR}`);
          $(this)
            .attr('id', `${currentDropC}-${currentDropR}`)
        }
        dropC = currentDropC
        dropR = currentDropR
      },
      stop: function(event, ui) {
        $('.drop').draggable('disable');
        $(this)
          .animate({
            left: `${SIZE*dropC}px`,
            top: `${SIZE*dropR}px`
          }, 'fast')
          .promise().done(function() {
            checkDrop();
          });
      }
    });
  });
});
