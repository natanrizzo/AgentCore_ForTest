# 1. Instalar Specify CLI

Instalação recomendada através do `uv`:
```bash
	uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
``` 

Então para utilizar o Specify:
```bash
	specify init <PROJECT_NAME>
	specify check
```

Ou então para inicializar em um projeto já existente:
```bash
	specify init --here
```

Então, selecionar as configurações desejadas no menu que aparecer.

# 2. Utilizando o Specify CLI

Os comandos a seguir devem ser utilizados no chat do seu copilot.

---

## Comandos.

- `/speckit.constitution.md` -> Mais pra definição de regras de negócio e informações gerais. Como clean code, dry etc..

- `/speckit.specify.md` -> Definir uma task, que utiliza o speckit.constitution.md como guideline além de se basear na estrutura do projeto.

- `/speckit.clarify.md` -> Cria um arquivo de esclarecimento da spec anterior, entendendod melhor alguns detalhes da task, com exemplos. Por exemplo, fazer a interface utilizando: modal, dropdown, vantagens e desvantagens de cada um etc.. Você então responde à essas questões para a IA entender melhor o que deve ser feito.

- `/speckit.plan.md` -> Gera a documentação do plano.

- `/speckit.tasks.md` -> Gera as tasks que devem ser feitas, com step-by-step de acordo com o plano.

- `/speckit.analyze.md` -> Faz uma analise para checar uma coesão entre spec, clarify, plan e as tasks.

- `/speckit.implement.md` -> Implementa em código, as features apresentadas nas tasks.