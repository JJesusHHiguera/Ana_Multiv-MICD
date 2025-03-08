from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func # Esto nos va a permitir utilizar funciones de agregación de SQL

app = Flask(__name__)
# Configuremos la base de datos de MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://usuario:contraseña@localhost/base_de_datos'
db = SQLAlchemy(app)

# Definimos un modelo llamado NobelPrize
class NobelPrize(db.Model):
    __tablename__ = 'nobel_winners' #Nombre de la tabla
    id = db.Column(db.Integer, primary_key=True) #Estructura proveiente de la tabla
    name = db.Column(db.String(100))
    year = db.Column(db.Integer)
    category = db.Column(db.String(50))
    country = db.Column(db.String(50))
    link = db.Column(db.String(100))

# Ruta para obtener 5 premios Nobel
@app.route('/api/nobel_winners', methods=['GET'])
def get_nobel_prizes():
    prizes = NobelPrize.query.order_by(func.rand()).limit(5).all()  # comandos de SQL. rand() hace que la elección sea aleatoria
    prizes_data = [{'name': prize.name, 'year': prize.year, 'category': prize.category,
                    'country': prize.country, 'link': prize.link} for prize in prizes]  # Lista de diccionarios con los datos requeridos
    return jsonify(prizes_data) # Pasamos la lista a un formato JSON

# Ruta para obtener la cantidad de ganadores por país (primera gráfica)
@app.route('/api/nobel_winners_by_country', methods=['GET'])
def get_nobel_winners_by_country():
    result = db.session.query(NobelPrize.country, func.count(NobelPrize.country)).group_by(NobelPrize.country).all() # Agrupamos y contamos
    countries = [row[0] for row in result]                                                                           # por país
    winners_count = [row[1] for row in result]  #Guardamos el conteo de ganadores por cada país
    return jsonify({'countries': countries, 'winners_count': winners_count})

# Ruta para obtener la cantidad de categorías de premios Nobel por cada país (segunda gráfica)
@app.route('/api/nobel_winners_by_category_and_country', methods=['GET'])
def get_nobel_winners_by_category_and_country():
    # Filtramos los registros cuando el país o la categoría están vacíos y asignamos un valor por defecto
    result = db.session.query(
        db.func.coalesce(NobelPrize.country, 'Desconocido').label('country'),   #coalesce devuelve el primer valor no nulo
        db.func.coalesce(NobelPrize.category, 'Desconocido').label('category'), #asignamos el valor 'desconocido'
        func.count(NobelPrize.id)
    ).filter(
        NobelPrize.country.isnot(None),
        NobelPrize.category.isnot(None)
    ).group_by('country', 'category').all()
    # Organicemos los datos en un formato más adecuado
    data = {}
    for row in result:
        country = row[0]
        category = row[1]
        count = row[2]

        if country not in data:
            data[country] = {}
        data[country][category] = count

    return jsonify(data)


# Ruta para la interfaz de usuario
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)