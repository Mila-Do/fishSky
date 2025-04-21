export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      flashcards: {
        Row: {
          id: string;
          userId: string;
          generationId: string | null;
          front: string;
          back: string;
          status: Database['public']['Enums']['flashcard_status'];
          source: Database['public']['Enums']['flashcard_source'];
          aiMetadata: Json | null;
          createdAt: string;
          updatedAt: string;
          deletedAt: string | null;
        };
        Insert: {
          id?: string;
          userId: string;
          generationId?: string | null;
          front: string;
          back: string;
          status?: Database['public']['Enums']['flashcard_status'];
          source: Database['public']['Enums']['flashcard_source'];
          aiMetadata?: Json | null;
          createdAt?: string;
          updatedAt?: string;
          deletedAt?: string | null;
        };
        Update: {
          id?: string;
          userId?: string;
          generationId?: string | null;
          front?: string;
          back?: string;
          status?: Database['public']['Enums']['flashcard_status'];
          source?: Database['public']['Enums']['flashcard_source'];
          aiMetadata?: Json | null;
          createdAt?: string;
          updatedAt?: string;
          deletedAt?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'flashcards_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'flashcards_generationId_fkey';
            columns: ['generationId'];
            isOneToOne: false;
            referencedRelation: 'generations';
            referencedColumns: ['id'];
          },
        ];
      };
      generationErrorLogs: {
        Row: {
          id: string;
          userId: string;
          model: string;
          sourceTextHash: string;
          sourceTextLength: number;
          errorCode: string;
          errorMessage: string;
          createdAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          model: string;
          sourceTextHash: string;
          sourceTextLength: number;
          errorCode: string;
          errorMessage: string;
          createdAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          model?: string;
          sourceTextHash?: string;
          sourceTextLength?: number;
          errorCode?: string;
          errorMessage?: string;
          createdAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'generationErrorLogs_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      generations: {
        Row: {
          id: string;
          userId: string;
          model: string;
          generatedCount: number;
          acceptedUneditedCount: number;
          acceptedEditedCount: number;
          sourceTextHash: string;
          sourceTextLength: number;
          generationDuration: number;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          model: string;
          generatedCount?: number;
          acceptedUneditedCount?: number;
          acceptedEditedCount?: number;
          sourceTextHash: string;
          sourceTextLength: number;
          generationDuration: number;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          model?: string;
          generatedCount?: number;
          acceptedUneditedCount?: number;
          acceptedEditedCount?: number;
          sourceTextHash?: string;
          sourceTextLength?: number;
          generationDuration?: number;
          createdAt?: string;
          updatedAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'generations_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          email: string;
          passwordHash: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          email: string;
          passwordHash: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          email?: string;
          passwordHash?: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      citext: {
        Args: { '': string } | { '': boolean } | { '': unknown };
        Returns: string;
      };
      citext_hash: {
        Args: { '': string };
        Returns: number;
      };
      citextin: {
        Args: { '': unknown };
        Returns: string;
      };
      citextout: {
        Args: { '': string };
        Returns: unknown;
      };
      citextrecv: {
        Args: { '': unknown };
        Returns: string;
      };
      citextsend: {
        Args: { '': string };
        Returns: string;
      };
    };
    Enums: {
      flashcard_source: 'ai-full' | 'ai-edited' | 'manual';
      flashcard_status: 'pending' | 'accepted' | 'rejected' | 'custom';
    };
    CompositeTypes: Record<never, never>;
  };
}

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      flashcard_source: ['ai-full', 'ai-edited', 'manual'],
      flashcard_status: ['pending', 'accepted', 'rejected', 'custom'],
    },
  },
} as const;
