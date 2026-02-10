from app.schemas.produto import (
    ProdutoBase,
    ProdutoCreate,
    ProdutoUpdate,
    ProdutoResponse
)

from app.schemas.auth import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    Token,
    TokenData,
    LoginRequest
)

from app.schemas.lista_compras import (
    ItemListaComprasBase,
    ItemListaComprasCreate,
    ItemListaComprasUpdate,
    ItemListaComprasResponse,
    ListaComprasBase,
    ListaComprasCreate,
    ListaComprasUpdate,
    ListaComprasResponse,
    ListaComprasSummary
)

from app.schemas.compra import (
    ItemCompraBase,
    ItemCompraCreate,
    ItemCompraResponse,
    CompraBase,
    CompraCreate,
    CompraUpdate,
    CompraResponse,
    CompraSummary,
    FinalizarListaRequest
)

from app.schemas.categoria import (
    CategoriaBase,
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaResponse,
)

__all__ = [
    # Produto
    "ProdutoBase", "ProdutoCreate", "ProdutoUpdate", "ProdutoResponse",
    # Auth
    "UserBase", "UserCreate", "UserUpdate", "UserResponse",
    "Token", "TokenData", "LoginRequest",
    # Lista Compras
    "ItemListaComprasBase", "ItemListaComprasCreate", "ItemListaComprasUpdate", "ItemListaComprasResponse",
    "ListaComprasBase", "ListaComprasCreate", "ListaComprasUpdate", "ListaComprasResponse", "ListaComprasSummary",
    # Compra
    "ItemCompraBase", "ItemCompraCreate", "ItemCompraResponse",
    "CompraBase", "CompraCreate", "CompraUpdate", "CompraResponse", "CompraSummary",
    "FinalizarListaRequest",
    # Categoria
    "CategoriaBase", "CategoriaCreate", "CategoriaUpdate", "CategoriaResponse",
]
