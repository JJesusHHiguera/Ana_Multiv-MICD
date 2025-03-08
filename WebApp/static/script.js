document.addEventListener('DOMContentLoaded', function () {
    // Obtengamos 5 premios Nobel
    axios.get('/api/nobel_winners')
        .then(response => {
            const nobelList = document.getElementById('nobelList');
            response.data.forEach(prize => {
                const li = document.createElement('li');

                // Creemos el enlace a Wikipedia
                const link = document.createElement('a');
                link.href = prize.link;  // Asignemos la URL del enlace a Wikipedia
                link.textContent = prize.name;  // El enlace lo queremos en el nombre de cada ganador
                link.target = '_blank';  // La página se aabrirá en una nueva pestaña
                link.style.color = 'blue';  // Esta línea y la siguiente son para resaltar el hipervínculo
                link.style.textDecoration = 'underline';

                // Coloquemos el texto completo de cada elemento de la lista
                const liText = document.createTextNode(`${prize.year} - ${prize.category}: `);
                const countryText = document.createTextNode(` (${prize.country})`);

                // Estructura de cada elemento de la lista
                li.appendChild(liText)  // Año y categoría
                li.appendChild(link)    // Nombre con el hipervínculo
                li.appendChild(countryText);    // País

                // Agregamos todo junto a la lista
                nobelList.appendChild(li)
            });
        })
        .catch(error => {
            console.error('Error al obtener los premios Nobel:', error);
        });

    // Obtengamos la cantidad de ganadores por país para la gráfica
    axios.get('/api/nobel_winners_by_country')
        .then(response => {
            const countries = response.data.countries;
            const winnersCount = response.data.winners_count;

            // Configuración de la gráfica
            const ctx = document.getElementById('nobelChart').getContext('2d'); // Confirmar ID en el documento HTML
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: countries,
                    datasets: [{
                        label: 'Ganadores por país',
                        data: winnersCount,
                        backgroundColor: 'rgba(224, 32, 32, 0.88)',
                        borderColor: 'rgb(0, 2, 3)',
                        borderWidth: 1.5
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error al obtener los datos por país:', error);
        });

    // Obtengamos la cantidad de categorías de premios Nobel ganados por país para la segunda gráfica
    axios.get('/api/nobel_winners_by_category_and_country')
        .then(response => {
            const data = response.data;

            // Preparemos  los datos para Chart.js
            const countries = Object.keys(data);
            const categories = [...new Set(Object.values(data).flatMap(Object.keys))];

            const datasets = categories.map(category => {
                return {
                    label: category,
                    data: countries.map(country => data[country][category] || 0),
                    backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
                };
            });

            // Configuración de la gráfica de barras apiladas
            const ctx = document.getElementById('stackedBarChart').getContext('2d');    // Verificar ID en el documento HTML
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: countries,
                    datasets: datasets
                },
                options: {
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error al obtener los datos por categoría y país:', error);
        });
    
});