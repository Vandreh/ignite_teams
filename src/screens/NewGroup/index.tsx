import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { AppError } from "@utils/AppError";
import { groupCreate } from "@storage/group/groupCreate";

import { Container, Content, Icon } from "./styles"; 

import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { Header } from "@components/Header";
import { Highlight } from "@components/Highlight";
import { Alert } from "react-native";

export function NewGroup() {
  const [group, setGroup] = useState('');

  const navigation = useNavigation();

  async function handleNew() {
    try {
      if (group.trim().length === 0) {
        setGroup('');
        return Alert.alert('New group', 'The group name cannot be empty!');
      }

      await groupCreate(group);
      navigation.navigate('players', { group }); //navigation.goBack(); 
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert('New group', error.message);
      } else {
        Alert.alert('New group', 'Unable to create a new group');
        console.log(error);
      }
    }
  }

  return (
    <Container>
      <Header showBackButton />

      <Content>
        <Icon />
        
        <Highlight 
          title="New Group"
          subtitle="Create the group to add people"
        />

        <Input
          placeholder="Group name"
          onChangeText={setGroup}
          value={group}
        />

        <Button 
          title="New"
          style={{ marginTop: 20 }}
          onPress={handleNew}
        />
      </Content>
    </Container>
  )
}