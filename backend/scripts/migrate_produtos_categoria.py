"""
Migração: adiciona coluna categoria_id em produtos e remove coluna categoria (string).

Execute uma vez se a tabela produtos ainda tiver a coluna antiga 'categoria'
(erro ao listar/criar produtos por causa da relação com categorias).

Na raiz do backend (onde está app/ e scripts/):
  python scripts/migrate_produtos_categoria.py
"""
import sys
import os

# Garante que o app está no path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine


def run_migration():
    with engine.connect() as conn:
        if engine.dialect.name == "postgresql":
            r = conn.execute(text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'produtos' AND column_name = 'categoria_id'
            """))
            if r.fetchone():
                print("Coluna categoria_id já existe. Nada a fazer.")
                return
            conn.execute(text("""
                ALTER TABLE produtos
                ADD COLUMN categoria_id INTEGER REFERENCES categorias(id)
            """))
            try:
                conn.execute(text("""
                    UPDATE produtos p SET categoria_id = c.id
                    FROM categorias c
                    WHERE p.categoria = c.nome AND p.categoria IS NOT NULL
                """))
            except Exception:
                pass
            conn.execute(text("ALTER TABLE produtos DROP COLUMN IF EXISTS categoria"))
            conn.commit()
            print("Migração concluída: produtos.categoria_id criada, produtos.categoria removida (se existia).")
        else:
            try:
                conn.execute(text(
                    "ALTER TABLE produtos ADD COLUMN categoria_id INTEGER REFERENCES categorias(id)"
                ))
                conn.commit()
                print("Migração concluída: coluna categoria_id adicionada.")
            except Exception as e:
                if "duplicate" in str(e).lower() or "already exists" in str(e).lower():
                    print("Coluna categoria_id já existe.")
                else:
                    raise


if __name__ == "__main__":
    run_migration()
