export PIPMIRROR="https://mirrors.aliyun.com/pypi/simple/"

export GRPC_PYTHON_BUILD_SYSTEM_ZLIB="true"
export GRPC_PYTHON_BUILD_SYSTEM_OPENSSL="true"

export PYTHON_FASTAPI_TEMPLATE_IMAGE="qsoyq/python-fastapi-template"

alias PIP_INSTALL_EXTRA="pip install --upgrade pysocks ipython httpx pyvim ruff poetry you-get vcron mac-cleanup git+https://github.com/qsoyq/pytoolkit.git"

alias python_format="yapf -r -i . && isort . && pycln -a ."

alias pi="poetry install"
alias pip="pip3"
alias python="python3"

alias ruff_run="ruff check . --fix && ruff format ."

pytoolkit_install_completion(){
    scripts=(
        "snowflake"
        "urandom"
        "ghi"
        "helloserver"
        "lc-chatbot"
        "openapi_download"
        "openapi_aggerator"
        "obsidian_image_download"
    )
    for element in "${scripts[@]}"; do
        "$element" -V
    done
}
# install_pytoolkit_completion
