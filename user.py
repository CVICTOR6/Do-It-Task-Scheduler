import random
from tabulate import tabulate

# Constants
POP_SIZE = 8  # Population size
CROSSOVER_PROB = 1.0  # 100%
MUTATION_PROB = 0.05  # 5%
MAX_VALUE = 31  # Values range from 0 to 31
TARGET_AVG = 29  # Termination condition

# Fitness function
def fitness(x):
    return x ** 2

# Generate initial population
def initialize_population():
    return [random.randint(0, MAX_VALUE) for _ in range(POP_SIZE)]

# Convert integer to binary (5-bit representation)
def int_to_bin(x):
    return format(x, '05b')

# Selection (Roulette Wheel Selection)
def selection(population):
    fitness_values = [fitness(x) for x in population]
    total_fitness = sum(fitness_values)
    selection_probs = [f / total_fitness for f in fitness_values]
    return random.choices(population, weights=selection_probs, k=POP_SIZE)

# Crossover operation
def crossover(parent1, parent2):
    if random.random() < CROSSOVER_PROB:
        point = random.randint(1, 4)  # Crossover point (1-4 for 5-bit representation)
        bin1, bin2 = int_to_bin(parent1), int_to_bin(parent2)
        child1_bin = bin1[:point] + bin2[point:]
        child2_bin = bin2[:point] + bin1[point:]
        return int(child1_bin, 2), int(child2_bin, 2)
    return parent1, parent2

# Mutation operation
def mutate(x):
    bin_x = list(int_to_bin(x))
    for i in range(len(bin_x)):
        if random.random() < MUTATION_PROB:
            bin_x[i] = '0' if bin_x[i] == '1' else '1'
    return int(''.join(bin_x), 2)

# Summation, average, and max
def calculate_stats(population):
    summation = sum(population)
    average = summation / len(population)
    maximum = max(population)
    return summation, average, maximum

# Genetic Algorithm execution
def genetic_algorithm():
    population = initialize_population()
    generation = 1

    while True:
        print(f"\nGeneration {generation}:")

        if generation == 1:
            # Print detailed information for the first generation
            table_data = []
            for x in population:
                table_data.append([int_to_bin(x), x, "", "", "", "", "", ""])

            # Selection
            selected_population = selection(population)
            for i, sel in enumerate(selected_population):
                table_data[i][2] = int_to_bin(sel)
                table_data[i][3] = sel

            # Crossover
            next_gen = []
            for i in range(0, POP_SIZE, 2):
                p1, p2 = selected_population[i], selected_population[i + 1]
                c1, c2 = crossover(p1, p2)
                table_data[i][4] = int_to_bin(c1)
                table_data[i][5] = c1
                table_data[i + 1][4] = int_to_bin(c2)
                table_data[i + 1][5] = c2
                next_gen.extend([c1, c2])

            # Mutation
            for i in range(len(next_gen)):
                mutated = mutate(next_gen[i])
                table_data[i][6] = int_to_bin(mutated)
                table_data[i][7] = mutated
                next_gen[i] = mutated

            # Summation, average, and max
            summation, avg, max_val = calculate_stats(next_gen)
            table_data.append(["Summation", summation, "", "", "", "", "", ""])
            table_data.append(["Average", f"{avg:.2f}", "", "", "", "", "", ""])
            table_data.append(["Max", max_val, "", "", "", "", "", ""])

            # Display table
            headers = ["Initial", "X", "Selection", "X", "Crossover", "X", "Mutation", "X"]
            print(tabulate(table_data, headers=headers, tablefmt="grid"))

        else:
            # For subsequent generations, print only the final population (binary and integer) and average
            selected_population = selection(population)
            next_gen = []
            for i in range(0, POP_SIZE, 2):
                p1, p2 = selected_population[i], selected_population[i + 1]
                c1, c2 = crossover(p1, p2)
                next_gen.extend([c1, c2])

            # Apply mutation
            for i in range(len(next_gen)):
                next_gen[i] = mutate(next_gen[i])

            # Calculate stats
            summation, avg, max_val = calculate_stats(next_gen)
            table_data = [[int_to_bin(x), x] for x in next_gen]
            print(tabulate(table_data, headers=["Binary", "Integer"], tablefmt="grid"))
            print(f"Average Value: {avg:.2f}")

        # Check termination condition
        if avg >= TARGET_AVG:
            print("Termination Condition Met.")
            break

        # Update population and proceed to the next generation
        population = next_gen
        generation += 1

# Run the Genetic Algorithm
genetic_algorithm()
