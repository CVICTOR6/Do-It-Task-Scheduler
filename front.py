import random
from tabulate import tabulate

# Parameters
pop_size = 8  # Initial population size
crossover_prob = 1.0  # Probability of crossover happening
mutation_prob = 0.05  # Mutation rate
max_value = 31  # Maximum integer representation (5-bit numbers)
targetAvg = 29  # Target average for termination condition

# Fitness function (basic quadratic)
def fitness(num):
    return num ** 2  

# Generate a random starting population
def init_population():
    pop = []
    for _ in range(pop_size):
        pop.append(random.randint(0, max_value))
    return pop

# Convert integer to 5-bit binary string
def int_to_bin(n):
    return bin(n)[2:].zfill(5)

# Roulette Wheel Selection (Handcrafted version)
def select_population(population):
    fitness_values = [fitness(x) for x in population]
    total_fitness = sum(fitness_values)
    
    selected = []
    for _ in range(pop_size):
        rand = random.uniform(0, total_fitness)
        cumulative = 0
        for i, f in enumerate(fitness_values):
            cumulative += f
            if cumulative >= rand:
                selected.append(population[i])
                break
    return selected

# Single-point crossover
def perform_crossover(p1, p2):
    if random.random() < crossover_prob:
        cut = random.randint(1, 4)  
        b1, b2 = int_to_bin(p1), int_to_bin(p2)
        c1 = b1[:cut] + b2[cut:]
        c2 = b2[:cut] + b1[cut:]
        return int(c1, 2), int(c2, 2)
    return p1, p2

# Mutation function (random bit-flipping)
def mutate_gene(n):
    bin_repr = list(int_to_bin(n))
    for i in range(len(bin_repr)):
        if random.random() < mutation_prob:
            bin_repr[i] = '1' if bin_repr[i] == '0' else '0'
    return int(''.join(bin_repr), 2)

# Compute total, average, and max
def compute_stats(pop):
    total = sum(pop)
    avg = total / len(pop)
    return total, avg, max(pop)

# Genetic Algorithm main function
def genetic_algorithm():
    population = init_population()
    generation = 1

    while True:
        print(f"\nGeneration {generation}:")
        
        if generation == 1:
            # Debugging - Print initial population
            table = [[int_to_bin(x), x] for x in population]
            print("Initial Population:")
            print(tabulate(table, headers=["Binary", "Integer"], tablefmt="grid"))

        # Selection phase
        selected = select_population(population)

        # Crossover phase
        next_generation = []
        for i in range(0, len(selected), 2):
            c1, c2 = perform_crossover(selected[i], selected[i+1])
            next_generation.append(c1)
            next_generation.append(c2)

        # Mutation phase
        mutated_generation = [mutate_gene(x) for x in next_generation]

        # Compute stats
        summation, avg, max_val = compute_stats(mutated_generation)

        # Debugging - Print new generation
        table = [[int_to_bin(x), x] for x in mutated_generation]
        print(tabulate(table, headers=["Binary", "Integer"], tablefmt="grid"))
        print(f"Average: {avg:.2f}, Max: {max_val}")

        # Termination condition
        if avg >= targetAvg:
            print("Termination condition met! Evolution complete.")
            break

        # Update population
        population = mutated_generation
        generation += 1

# Execute the Genetic Algorithm
genetic_algorithm()
