
mapboxgl.accessToken = mapToken


const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: foundCamp.geometry.coordinates,
    zoom: 8 // starting zoom

});

const marker1 = new mapboxgl.Marker({ "color": "#e60d05" })
    .setLngLat(foundCamp.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 10 })
            .setHTML(
                `<h4>${foundCamp.title}</h4><p>${foundCamp.location}<p>`
            )
    )
    .addTo(map)


