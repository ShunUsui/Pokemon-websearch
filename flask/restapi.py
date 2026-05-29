import os
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import psycopg2
from dotenv import load_dotenv

script_dir = os.path.dirname(os.path.abspath(__file__))

website_dir = os.path.dirname(script_dir)

env_path = os.path.join(website_dir, '.env')

load_dotenv(dotenv_path=env_path)

app = Flask(__name__, template_folder='../templates',
            static_folder='../static')

CORS(app)

def get_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"), 
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"), 
        port=int(os.getenv("DB_PORT", 5432))
    )

@app.route('/')
def home():
    return "Server is running"


@app.route('/api/pokemon')
def pokemon():
    search = request.args.get('q', '')
    gens = request.args.get('gens', '')
    types = request.args.get('types', '')
    mode = request.args.get('mode', 'any')
    special = request.args.get('special', '')
    hp = request.args.get('hp', '')
    attack = request.args.get('attack', '')
    sattack = request.args.get('sattack', '')
    defense = request.args.get('defense', '')
    sdefense = request.args.get('sdefense', '')
    speed = request.args.get('speed', '')
    weight = request.args.get('weight', '')
    height = request.args.get('height', '')
    move = request.args.get('move', '')
    abilities = request.args.get('ability', '')
    games = request.args.get('game', '')

    conn = get_connection()
    cursor = conn.cursor()

    params = []
    conditions = []
    special_conditions = []

    allowed_specials = ["is_sub_legendary", "is_legendary", "is_mythical", "is_ultra_beast", "is_paradox"]

    def add_int_filter(value, column):
        if value not in ("", None):
            conditions.append(f"{column} = %s")
            params.append(int(value))

    sql = """
        SELECT
            p.pokedex_id,
            p.name,
            COALESCE(STRING_AGG(DISTINCT t.name, ', '), '') AS types
        FROM Pokemon p
        LEFT JOIN pokemon_types pt ON p.id = pt.pokemon_id
        LEFT JOIN types t ON pt.type_id = t.id
        LEFT JOIN pokemon_species ps ON p.species_id = ps.id
    """

    if move:
        sql += """
        LEFT JOIN pokemon_moves pm ON p.id = pm.pokemon_id
        LEFT JOIN moves m ON pm.move_id = m.id
        """
        conditions.append("LOWER(m.name) = %s")
        params.append(move.lower())

    if abilities:
        sql += """
        LEFT JOIN pokemon_abilities pa ON p.id = pa.pokemon_id
        LEFT JOIN abilities a ON pa.ability_id = a.id
        """
        conditions.append("LOWER(a.name) = %s")
        params.append(abilities.lower())

    if search:
        if search.isdigit():
            conditions.append("p.pokedex_id = %s")
            params.append(int(search))
        else:
            conditions.append("LOWER(p.name) LIKE %s")
            params.append(f"%{search.lower()}%")

    if games:
        conditions.append("""
            EXISTS (
                SELECT 1
                FROM pokemon_version_groups pvg2
                JOIN version_group vg2 ON pvg2.game_id = vg2.id
                JOIN pkm_versions pv2 ON vg2.id = pv2.group_id
                WHERE pvg2.pokemon_id = p.id
                AND LOWER(pv2.name) = %s
            )
        """)
        params.append(games.lower())

    if gens:
        sql += """
        LEFT JOIN pokemon_version_groups pvg ON p.id = pvg.pokemon_id
        LEFT JOIN version_group vg ON pvg.game_id = vg.id
        """
        gen_list = gens.split(",")
        placeholders = ",".join(["%s"] * len(gen_list))
        conditions.append(f"vg.generation IN ({placeholders})")
        params.extend(gen_list)

    if special:
        special_list = special.split(",")
        for i in special_list:
            if i in allowed_specials:
                special_conditions.append(f"ps.{i} = true")

    add_int_filter(attack, "p.base_attack")
    add_int_filter(defense, "p.base_defense")
    add_int_filter(sattack, "p.base_special_attack")
    add_int_filter(sdefense, "p.base_special_defense")
    add_int_filter(hp, "p.base_hp")
    add_int_filter(speed, "p.base_speed")
    add_int_filter(weight, "ps.weight")
    add_int_filter(height, "ps.height")

    if special_conditions:
        conditions.append("(" + " OR ".join(special_conditions) + ")")

    if conditions:
        sql += " WHERE " + " AND ".join(conditions)

    sql += " GROUP BY p.pokedex_id, p.name"

    if types:
        type_list = types.split(",")
        placeholders = ",".join(["%s"] * len(type_list))

        if mode == "any":
            sql += f"""
                HAVING COUNT(DISTINCT t.name) FILTER (WHERE t.name IN ({placeholders})) > 0
            """
            params.extend(type_list)

        elif mode == "all":
            sql += f"""
                HAVING COUNT(DISTINCT t.name) FILTER (WHERE t.name IN ({placeholders})) = %s
            """
            params.extend(type_list)
            params.append(len(type_list))

    sql += " ORDER BY p.pokedex_id"

    cursor.execute(sql, params)
    results = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify([
        {"id": r[0], "name": r[1], "types": r[2]}
        for r in results
    ])


if __name__ == '__main__':
    app.run(debug=True)