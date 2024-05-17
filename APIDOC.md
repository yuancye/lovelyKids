# *Lovely Kids* API Documentation
The Lovely Kids API is designed to support a children's behavior management system. It streamlines the process of rewarding positive behaviors and addressing negative ones, ensuring consistency and effectiveness in behavior management. It provides endpoints to retrieve icons, usernames, and detailed user information, as well as to create new users, save user-specific rules, and update user stars. Each type of query produces output in plain text or JSON format. The request will return an HTTP error code of 400 (Invalid request) or 500 (Server Error) rather than the default 200 if there is somthing wrong with the data processing.

The rest of this document provides more details about each API endpoints.

## *Retrieve Icons*
**Request Format:** */icons*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Retrieves the list of available icons from the server. If there are icons, the icons name will be returned as a json format {"icons": []"}*

**Example Request:** *http://localhost:8000/icons*

**Example Response:**

```
{
"icons":
  ["public/icons/bird.png",
  "public/icons/fish.png",
  "public/icons/frog.png",
  "public/icons/giraffe.png",
  "public/icons/lion.png",
  "public/icons/owl.png",
  "public/icons/penguin.png",
  "public/icons/persian-cat.png",
  "public/icons/phone-call.png",
  "public/icons/pilot.png",
  "public/icons/smile.png"
  ]
}
```

**Error Handling:**
*Error message will be returned as a plain text*
```
1. 400: "Error reading directory".
2. 500: "Server Error. Try again".
```


## *Retrieve Usernames*
**Request Format:** */getname*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Retrieves the list of usernames from the server.*

**Example Request:** *http://localhost:8000/getname*

**Example Response:**

```
{
"users":
  ["Eason",
  "Stephanie"
  ]
}
```

**Error Handling:**
*Error message will be returned as a plain text*
```
1. 400: "Create user first".
2. 500: "Server Error. Try again".
```


## *Retrieve User Information*
**Request Format:** */getuserinfo*

**Request Type:** *GET*

**Returned Data Format**: JSON

**Description:** *Retrieves all users' information from the server*

**Example Request:** *http://localhost:8000/getuserinfo*

**Example Response:**

```
{
  "users":
  {
    "Eason": {
      "icon": "penguin",
      "star": 6,
      "rules": {
        "breakfast": "-2",
        "lunch ": "-5",
        "dinner": "-5",
        "being nice": "2",
        "handy helper": "2",
        "bed before 8:30 pm": "5",
        "keep room clean": "2"
      }
    },
    "Stephanie": {
      "icon": "pilot",
      "star": 7,
      "rules": {
        "breakfast": "-2",
        "lunch ": "-5",
        "dinner": "-5",
        "being nice": "2",
        "handy helper": "2",
        "bed before 8:30 pm": "5",
        "keep room clean": "2",
        "practice violin": "3",
        "writting": "2"
      }
    }
  }
}

```

**Error Handling:**
*Error message will be returned as a plain text*
```
1. 400: "No user exists. Create User First!".
2. 500: "Server Error. Try again".
```

## *Save User*
**Request Format:** */saveuser*

**Request Type:** *POST*

**Returned Data Format**: Plain Text

**Description:** *Creates a new user with the provided username and icon. Default icon is Lion.*

**Example Request:** *http://localhost:8000/saveuser*

**Example Response:**

```
"User Created"
```

**Error Handling:**

```
1. 400: "Input username",
        "User already exists"
2. 500: "Server Error. Try again"
```

## *Save Rules*
**Request Format:** */saverules*

**Request Type:** *POST*

**Returned Data Format**: Plain Text

**Description:** *Saves rules for a specific username.*

**Example Request:** *http://localhost:8000/saverules*

**Example Response:**

```
"Rules updated for ${username}"
```

**Error Handling:**
*Error message will be returned as a plain text*

```
1. 400: "Add rules first",
        "User does not exist"
2. 500: "Server Error. Try again"
```

## *Save Stars*
**Request Format:** */savestars*

**Request Type:** *POST*

**Returned Data Format**: Plain Text

**Description:** *Updates stars for a specific username.*

**Example Request:** *http://localhost:8000/savestars*

**Example Response:**

```
"Star has updated for ${username}"
```

**Error Handling:**
*Error message will be returned as a plain text*

```
1. 400: "User does not exist"
2. 500: "Server Error. Try again"
```