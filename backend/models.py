from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False, index=True)
    descricao = Column(Text)
    preco = Column(Float, nullable=False)
    quantidade_estoque = Column(Integer, default=0)
    categoria = Column(String(100))
    codigo_barras = Column(String(50), unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    listas_compras = relationship("ListaCompras", back_populates="user", cascade="all, delete-orphan")
    compras = relationship("Compra", back_populates="user", cascade="all, delete-orphan")

class ListaCompras(Base):
    __tablename__ = "listas_compras"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concluida = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="listas_compras")
    itens = relationship("ItemListaCompras", back_populates="lista", cascade="all, delete-orphan")

class ItemListaCompras(Base):
    __tablename__ = "itens_lista_compras"

    id = Column(Integer, primary_key=True, index=True)
    lista_id = Column(Integer, ForeignKey("listas_compras.id"), nullable=False)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=True)
    nome_item = Column(String(255), nullable=False)
    quantidade = Column(Integer, default=1)
    comprado = Column(Boolean, default=False)
    preco_estimado = Column(Float, nullable=True)
    observacao = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    lista = relationship("ListaCompras", back_populates="itens")
    produto = relationship("Produto")

class Compra(Base):
    __tablename__ = "compras"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lista_id = Column(Integer, ForeignKey("listas_compras.id"), nullable=True)
    data_compra = Column(DateTime(timezone=True), server_default=func.now())
    valor_total = Column(Float, nullable=False)
    local_compra = Column(String(255))
    observacao = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="compras")
    lista = relationship("ListaCompras")
    itens = relationship("ItemCompra", back_populates="compra", cascade="all, delete-orphan")

class ItemCompra(Base):
    __tablename__ = "itens_compra"

    id = Column(Integer, primary_key=True, index=True)
    compra_id = Column(Integer, ForeignKey("compras.id"), nullable=False)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=True)
    nome_item = Column(String(255), nullable=False)
    quantidade = Column(Integer, nullable=False)
    preco_unitario = Column(Float, nullable=False)
    preco_total = Column(Float, nullable=False)
    categoria = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    compra = relationship("Compra", back_populates="itens")
    produto = relationship("Produto")
