function getEpisodes() {
    let data = {}

    // Clear result div
    $('.result').empty();

    // Show spinner
    $('.loader').css('display', 'inline-block');

    // Make express call to retrieve podcast episodes
    $.get('/spotify', data, function(res) {
        $.each(res, function(index, value) {

            //Add podcast image
            var img = document.createElement('img');
            img.src = res[index].url
            img.height = 100
            img.width = 100
            $('.result')[0].appendChild(img);

            // Add episode info
            var info = document.createElement('p');
            info.innerHTML = res[index].episode_name + '<br />' + res[index].release_date
            $('.result')[0].appendChild(info);
        });
        $('.loader').css('display', 'none');
        console.log(res)
    })
}

function getShows() {
    $.get('/spotify/shows', {});
}