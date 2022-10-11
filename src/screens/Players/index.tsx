import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, TextInput } from "react-native"; //import { Alert, FlatList, Keyboard, TextInput } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { AppError } from "@utils/AppError";

import { PlayerStorageDTO } from "@storage/player/playerStorageDTO";
import { playerAddByGroup } from "@storage/player/playerAddByGroup";
import { playerRemoveByGroup } from "@storage/player/playerRemoveByGroup";
import { playersGetByGroupAndTeam } from "@storage/player/playersGetByGroupAndTeam";
import { groupRemoveByName } from "@storage/group/groupRemoveByName";

import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { Filter } from "@components/Filter";
import { Header } from "@components/Header";
import { Highlight } from "@components/Highlight";
import { ListEmpty } from "@components/ListEmpty";
import { ButtonIcon } from "@components/ButtonIcon";
import { PlayerCard } from "@components/PlayerCard";

import { Container, Form, HeaderList, NumberOfPlayers } from "./styles";
import { Loading } from "@components/Loading";

type RouteParams = {
    group: string;
}

export function Players() {
    const [isLoading, setIsLoading] = useState(true);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [team, setTeam] = useState('Team A');
    const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);

    const navigation = useNavigation();
    const route = useRoute();
    const { group } = route.params as RouteParams;

    const newPlayerNameInputRef = useRef<TextInput>(null);

    async function handleAddPlayer() {
        if (newPlayerName.trim().length === 0) {
            setNewPlayerName('')
            return Alert.alert('New Person', 'Enter the name of the person to add.');
        }

        const newPlayer = {
            name: newPlayerName,
            team
        }

        try {
            await playerAddByGroup(newPlayer, group);

            newPlayerNameInputRef.current?.blur(); //newPlayerNameInputRef.current?.focus(); Keyboard.dismiss();
            
            setNewPlayerName('');
            fetchPlayersByTeam();
        } catch (error) {
            if (error instanceof AppError) {
                Alert.alert('New Player', error.message);
            } else {
                console.log(error);
                Alert.alert('New Player', 'Could not add.');
            }
        }
    }

    async function fetchPlayersByTeam() {
        try {
            setIsLoading(true);

            const playersByTeam = await playersGetByGroupAndTeam(group, team);
            
            setPlayers(playersByTeam);
        } catch (error) {
            console.log(error);
            Alert.alert('Players', 'It was not possible to load the players of the selected team!');
        } finally {
            setIsLoading(false);
        }
    }

    async function handlePlayerRemove(playerName: string) {
        try {
            await playerRemoveByGroup(playerName, group);
            fetchPlayersByTeam();
        } catch (error) {
            console.log(error);
            Alert.alert('Remove Player', 'Could not remove this player');
        }
    }

    async function groupRemove() {
        try {
            await groupRemoveByName(group);
            navigation.navigate('groups');
        } catch (error) {
            console.log(error);
            Alert.alert('Remove group', 'Could not remove this group');
        }
    }

    async function handleGroupRemove() {
        Alert.alert(
            'Remove',
            'Want to remove the group?',
            [
                { text: 'No', style: 'cancel' },
                { text: 'Yes', onPress: () => groupRemove()}
            ]
        );
    }

    useEffect(() => {
        fetchPlayersByTeam();
    }, [team]);

    return (
        <Container>
            <Header showBackButton />

            <Highlight
                title={group}
                subtitle="Add people and separate teams"
            />
            <Form>
                <Input
                    inputRef={newPlayerNameInputRef}
                    onChangeText={setNewPlayerName}
                    value={newPlayerName}
                    placeholder="Persons name"
                    autoCorrect={false}
                    onSubmitEditing={handleAddPlayer}
                    returnKeyType="done"
                />

                <ButtonIcon
                    icon="add"
                    onPress={handleAddPlayer}
                />
            </Form>

            <HeaderList>
                <FlatList
                    data={['Team A', 'Team B']}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <Filter
                            title={item}
                            isActive={item === team}
                            onPress={() => setTeam(item)}
                        />
                    )}
                    horizontal
                />

                <NumberOfPlayers>
                    {players.length}
                </NumberOfPlayers>
            </HeaderList>

            {
                isLoading ? <Loading /> :
            
                <FlatList
                    data={players}
                    keyExtractor={item => item.name}
                    renderItem={({ item }) => (
                        <PlayerCard
                            name={item.name}
                            onRemove={() => handlePlayerRemove(item.name)}
                        />
                    )}
                    ListEmptyComponent={() => (
                        <ListEmpty
                          message="There is no one on this team."
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[{ paddingBottom: 100 }, players.length === 0 && { flex: 1}]}
                />
            }
                <Button
                    title="Remove Team"
                    type="SECONDARY"
                    onPress={handleGroupRemove}
                />
        </Container>
    );
}