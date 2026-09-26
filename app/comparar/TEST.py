# 1. Ler o nome do cliente
nome = input("Digite o nome do cliente: ")

# 2. Ler o valor original da compra
valor_original = float(input("Digite o valor da compra (R$): "))

# 3, 4 e 5. Verificar a condição e aplicar o desconto se for maior que 150
if valor_original > 150:
    desconto = valor_original * 0.10
    valor_final = valor_original - desconto
else:
    valor_final = valor_original

# 6. Exibir o nome do cliente, o valor original e o valor final a pagar
print("\n--- RESUMO DA COMPRA ---")
print(f"Cliente: {nome}")
print(f"Valor original: R$ {valor_original:}")
print(f"Valor final a pagar: R$ {valor_final:}")
