import pandas as pd
import re
import requests
from names_dataset import NameDataset
from pathlib import Path

# Path handling
base = Path(__file__).resolve().parent
data_file = base / ".." / "data" / "names.txt"
data_file = data_file.resolve()


# Functions
def convert_to_pd(data: dict) -> pd.DataFrame:
    df = []

    for country, genders in data.items():
        if isinstance(genders, dict):
            for gender, names in genders.items():
                for name in names:
                    df.append(
                        {
                            "name": name,
                            "gender": gender,
                            "country_alpha2": country,
                        }
                    )
        # If genders is not a dict, then its a list of names
        else:
            for name in genders:
                df.append(
                    {"name": name, "gender": None, "country_alpha2": country}
                )

    return pd.DataFrame(df)


def extract_names(
    n: int, cca2: list, rm_non_latin: bool = True
) -> pd.arrays.StringArray:
    # Extract names
    male_names = nd.get_top_names(n=n, gender="Male", use_first_names=True)
    male_names = convert_to_pd(male_names)

    female_names = nd.get_top_names(n=n, gender="Female", use_first_names=True)
    female_names = convert_to_pd(female_names)

    lastnames = nd.get_top_names(n=n, use_first_names=False)
    lastnames = convert_to_pd(lastnames)

    all_names = pd.concat(
        [male_names, female_names, lastnames], ignore_index=True
    )
    all_names_filtered = all_names.loc[all_names["country_alpha2"].isin(cca2)]

    # Remove non-latin
    if rm_non_latin:
        all_names_filtered["is_latin"] = all_names["name"].apply(
            lambda text: is_latin(text, latin_regex)
        )
        all_names_filtered = all_names_filtered[all_names_filtered["is_latin"]]

    # Dedup
    return all_names_filtered["name"].sort_values().unique()


# Pattern: match any character NOT in Latin ranges (U+0000–U+024F)
# TODO: Keep all extended latin chars?
latin_regex = re.compile(r"[^\u0000-\u024F]")


def is_latin(text: str, latin_regex: re.Pattern[str]) -> bool:
    return not bool(re.search(latin_regex, text))


def write_to_txt(names: pd.arrays.StringArray, file_name: str) -> None:
    # Path handling
    base = Path(__file__).resolve().parent
    data_file = base / ".." / "data" / file_name
    data_file = data_file.resolve()

    # Write file
    with data_file.open("w+") as file:
        for name in names:
            file.write(name + "\n")

    print(f"Generated {len(names)} names in {data_file}!")


# Get data ----

# Top 20 Countries ----

# Countries
# Select countries  from restcountries API
# fields: https://gitlab.com/restcountries/restcountries/-/blob/master/FIELDS.md
fields = ["cca2", "population", "region", "subregion"]
url = f"https://restcountries.com/v3.1/all?fields={','.join(fields)}"
response = requests.get(url)
data = response.json()

countries_api = pd.json_normalize(data)

# Names
nd = NameDataset()
countries_names = [c.alpha_2 for c in nd.get_country_codes()]

# Remove countries not present in names dataset
countries_api = countries_api.loc[countries_api["cca2"].isin(countries_names)]


# Hyperparams for output
n = 3000  # per country
top_n_countries = 20
countries_api_top = (
    countries_api.sort_values("population", ascending=False)
    .head(top_n_countries)["cca2"]
    .tolist()
)

print(f"Top 20 countries:\n{countries_api_top}")

top_20_names = extract_names(n=3000, cca2=countries_api_top)
write_to_txt(top_20_names, "names_top_20_countries.txt")

exit()
## Western names ----
western_subregions = [
    "Western Europe",
    "Central Europe",
    "Eastern Europe",
    "North America",
    "Central America",
]

western_countries = countries_api[
    countries_api["subregion"].str.contains("|".join(western_subregions))
]["cca2"]

print(western_countries)

## European names ----
european_countries = countries_api[
    countries_api["region"].str.contains("Europe")
]["cca2"]

print(european_countries)
exit()
## Asian names ----
asian_countries = countries_api[countries_api["region"].str.contains("Asia")][
    "cca2"
]

print(asian_countries)
