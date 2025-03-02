import random
from tabulate import tabulate

# Constants
POP_SIZE = 8
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
    
    selected = random.choices(population, weights=selection_probs, k=POP_SIZE)
    return selected

# Crossover operation
def crossover(parent1, parent2):
    if random.random() < CROSSOVER_PROB:
        point = random.randint(1, 4)  # Crossover point (1-4 for 5-bit representation)
        bin1, bin2 = int_to_bin(parent1), int_to_bin(parent2)
        
        child1_bin = bin1[:point] + bin2[point:]
        child2_bin = bin2[:point] + bin1[point:]
        
        return int(child1_bin, 2), int(child2_bin, 2), point
    return parent1, parent2, None

# Mutation operation
def mutate(x):
    bin_x = list(int_to_bin(x))
    mutated = False
    for i in range(len(bin_x)):
        if random.random() < MUTATION_PROB:
            bin_x[i] = '0' if bin_x[i] == '1' else '1'
            mutated = True
    return int(''.join(bin_x), 2), mutated

# Genetic Algorithm execution
def genetic_algorithm():
    population = initialize_population()
    generation = 1
    
    while True:
        print(f"\nGeneration {generation}:")
        
        if generation == 1:
            print("Initial Population:")
            table = [[ind, int_to_bin(ind)] for ind in population]
            print(tabulate(table, headers=["Integer", "Binary"], tablefmt="grid"))
            
            # Selection
            selected_population = selection(population)
            print("\nAfter Selection:")
            table = [[ind, int_to_bin(ind)] for ind in selected_population]
            print(tabulate(table, headers=["Integer", "Binary"], tablefmt="grid"))
            
            # Crossover
            next_generation = []
            for i in range(0, POP_SIZE, 2):
                p1, p2 = selected_population[i], selected_population[i+1]
                c1, c2, point = crossover(p1, p2)
                print(f"Crossover at point {point}:")
                print(tabulate([[p1, int_to_bin(p1)], [p2, int_to_bin(p2)], [c1, int_to_bin(c1)], [c2, int_to_bin(c2)]], headers=["Integer", "Binary"], tablefmt="grid"))
                next_generation.extend([c1, c2])
            
            # Mutation
            for i in range(len(next_generation)):
                mutated_child, mutated = mutate(next_generation[i])
                if mutated:
                    print("Mutation:")
                    print(tabulate([[next_generation[i], int_to_bin(next_generation[i])], [mutated_child, int_to_bin(mutated_child)]], headers=["Integer", "Binary"], tablefmt="grid"))
                next_generation[i] = mutated_child
        else:
            next_generation = [mutate(x)[0] for x in selection(population)]
        
        population = next_generation
        avg_fitness = sum(population) / POP_SIZE
        print(f"\nEnd of Generation {generation}, Average Value: {avg_fitness:.2f}")
        
        if avg_fitness >= TARGET_AVG:
            print("Termination Condition Met.")
            break
        
        generation += 1

# Run the Genetic Algorithm
genetic_algorithm()
