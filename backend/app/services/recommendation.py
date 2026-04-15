def score_room(room, user):
    score = 0

    # Budget priority
    if room["rent"] <= user["budget"]:
        score += 30

    # Distance priority
    if room["distance_km"] <= user["max_distance_km"]:
        score += 25

    # Furnished preference
    if "furnished" in user["priorities"] and room["furnished"]:
        score += 20

    return score
